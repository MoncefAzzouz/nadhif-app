import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, requireAccount, isGuest, AuthenticatedRequest } from '../middlewares/auth';
import { OrderStatus, ProductOrigin, PointTransactionType } from '@prisma/client';
import { applyPointMovement, PointsError } from '../lib/points';
import { handleOrderCreated } from '../lib/notificationsHelper';
import { sendPushToUser } from '../lib/firebaseAdmin';
import { parseLocalDate } from './orders';

const router = Router();

// Every route below needs a signed-in user; the admin ones add requireAdmin.
router.use(authenticateToken as any);

function requireAdmin(req: AuthenticatedRequest, res: Response, next: any) {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

function fail(res: Response, err: unknown) {
  if (err instanceof PointsError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Server error' });
}

/** Whole, non-negative point value. Anything else is a client mistake. */
function readPoints(value: unknown, label: string): number {
  const num = Number(value ?? 0);
  if (!Number.isInteger(num) || num < 0) {
    throw new PointsError(`${label} must be a whole number of points (0 or more)`);
  }
  return num;
}

// ─── MOBILE: the signed-in customer ──────────────────────────────────────────

// GET /api/points/me — balance + history of the logged-in customer.
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  // A guest earns nothing and owns no history, but the screen still has to draw.
  if (isGuest(req)) {
    res.json({ points: 0, transactions: [], isGuest: true });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, points: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const transactions = await prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { order: { select: { id: true, scheduledDate: true, status: true } } },
    });

    res.json({ points: user.points, transactions });
  } catch (err) {
    fail(res, err);
  }
});

// GET /api/points/store — the catalog the customer can buy with points.
// Same services and categories as the paid catalog, but every priced step is
// returned in points. Only steps with a cost above zero are included, and a
// service/category with no affordable step at all is left out entirely.
router.get('/store', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [services, categories] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true, pointStoreEnabled: true },
        include: { houseConfigs: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.category.findMany({
        where: { isActive: true, pointStoreEnabled: true },
        include: { categoryServices: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    res.json({
      services: services
        .map((service) => ({
          id: service.id,
          name: service.name,
          nameAr: service.nameAr,
          nameFr: service.nameFr,
          description: service.description,
          descriptionAr: service.descriptionAr,
          descriptionFr: service.descriptionFr,
          picture: service.picture,
          durationHours: service.durationHours,
          details: service.details,
          extraWorkerPointCost: service.extraWorkerPointCost,
          rapidExtraWorkerPointCost: service.rapidExtraWorkerPointCost,
          materialPointCost: service.materialPointCost,
          materialsMandatory: service.materialsMandatory,
          localProductPointCost: service.localProductPointCost,
          importedProductPointCost: service.importedProductPointCost,
          productsMandatory: service.productsMandatory,
          houseConfigs: service.houseConfigs
            .filter((config) => config.pointCost > 0)
            .map((config) => ({
              id: config.id,
              type: config.type,
              typeAr: config.typeAr,
              typeFr: config.typeFr,
              workers: config.workers,
              durationHours: config.durationHours,
              pointCost: config.pointCost,
              rapidPointCost: config.rapidPointCost,
            })),
        }))
        .filter((service) => service.houseConfigs.length > 0),

      categories: categories
        .map((category) => ({
          id: category.id,
          name: category.name,
          nameAr: category.nameAr,
          nameFr: category.nameFr,
          description: category.description,
          descriptionAr: category.descriptionAr,
          descriptionFr: category.descriptionFr,
          picture: category.picture,
          details: category.details,
          materialPointCost: category.materialPointCost,
          materialsMandatory: category.materialsMandatory,
          localProductPointCost: category.localProductPointCost,
          importedProductPointCost: category.importedProductPointCost,
          productsMandatory: category.productsMandatory,
          categoryServices: category.categoryServices
            .filter((option) => option.pointCost > 0)
            .map((option) => ({
              id: option.id,
              name: option.name,
              nameAr: option.nameAr,
              nameFr: option.nameFr,
              workers: option.workers,
              durationHours: option.durationHours,
              pointCost: option.pointCost,
              rapidPointCost: option.rapidPointCost,
            })),
        }))
        .filter((category) => category.categoryServices.length > 0),
    });
  } catch (err) {
    fail(res, err);
  }
});

/**
 * Totals what a booking costs in points, mirroring the DZD calculation in
 * `POST /api/orders` step for step: base + extra workers + materials + products.
 */
async function quotePoints(body: any) {
  const {
    serviceId, houseConfigId, categoryId, categoryServiceId,
    extraWorkers, useMaterials, productOrigin, isRapid,
  } = body;

  const rapid = isRapid === true || isRapid === 'true';
  const workersCount = extraWorkers ? parseInt(extraWorkers.toString()) : 0;
  const origin = (productOrigin as ProductOrigin) || ProductOrigin.NONE;

  let total = 0;
  let materialsFlag = false;
  let label = '';

  if (serviceId && houseConfigId) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { houseConfigs: true },
    });
    if (!service) throw new PointsError('Service not found', 404);
    if (!service.isActive || !service.pointStoreEnabled) {
      throw new PointsError('This service cannot be bought with points', 400);
    }

    const config = service.houseConfigs.find((hc) => hc.id === houseConfigId);
    if (!config) throw new PointsError('House config not found for this service', 404);

    const base = rapid ? config.rapidPointCost : config.pointCost;
    if (base <= 0) throw new PointsError('This option cannot be bought with points', 400);

    materialsFlag = useMaterials === true || service.materialsMandatory;
    if (service.productsMandatory && origin === ProductOrigin.NONE) {
      throw new PointsError('Product origin selection is mandatory for this service');
    }

    total = base
      + workersCount * (rapid ? service.rapidExtraWorkerPointCost : service.extraWorkerPointCost)
      + (materialsFlag ? service.materialPointCost : 0)
      + (origin === ProductOrigin.LOCAL ? service.localProductPointCost : 0)
      + (origin === ProductOrigin.IMPORTED ? service.importedProductPointCost : 0);

    label = `${service.name} — ${config.type}`;
  } else if (categoryId && categoryServiceId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { categoryServices: true },
    });
    if (!category) throw new PointsError('Category not found', 404);
    if (!category.isActive || !category.pointStoreEnabled) {
      throw new PointsError('This category cannot be bought with points', 400);
    }

    const option = category.categoryServices.find((cs) => cs.id === categoryServiceId);
    if (!option) throw new PointsError('Category service not found', 404);

    const base = rapid ? option.rapidPointCost : option.pointCost;
    if (base <= 0) throw new PointsError('This option cannot be bought with points', 400);

    materialsFlag = useMaterials === true || category.materialsMandatory;
    if (category.productsMandatory && origin === ProductOrigin.NONE) {
      throw new PointsError('Product origin selection is mandatory for this category');
    }

    total = base
      + (materialsFlag ? category.materialPointCost : 0)
      + (origin === ProductOrigin.LOCAL ? category.localProductPointCost : 0)
      + (origin === ProductOrigin.IMPORTED ? category.importedProductPointCost : 0);

    label = `${category.name} — ${option.name}`;
  } else {
    throw new PointsError('Pick a service with its house type, or a category with its option');
  }

  return { total, materialsFlag, origin, workersCount, rapid, label };
}

// POST /api/points/quote — what would this booking cost in points?
// Lets the app show the total before the customer confirms.
router.post('/quote', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  try {
    const quote = await quotePoints(req.body);
    const user = isGuest(req)
      ? null
      : await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
    const balance = user?.points ?? 0;
    res.json({
      pointCost: quote.total,
      points: balance,
      affordable: balance >= quote.total,
      label: quote.label,
    });
  } catch (err) {
    fail(res, err);
  }
});

// POST /api/points/redeem — buy a booking with points.
// Body is the same as POST /api/orders (minus promoCode), because the customer
// goes through the very same steps; only the currency changes.
router.post('/redeem', requireAccount, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  const {
    serviceId, houseConfigId, categoryId, categoryServiceId,
    scheduledDate, address, latitude, longitude, sizeM2, clientNote, housePictures, isRapid,
  } = req.body;

  if (!scheduledDate || !address) {
    res.status(400).json({ error: 'Missing required fields: scheduledDate, address' });
    return;
  }

  try {
    const quote = await quotePoints(req.body);

    // Same blackout-day rule as a normal order.
    const scheduled = parseLocalDate(scheduledDate);
    const offset = scheduled.getTimezoneOffset();
    const localDate = new Date(scheduled.getTime() - offset * 60 * 1000);
    const dateString = localDate.toISOString().slice(0, 10);
    const lockedSetting = await prisma.appSetting.findUnique({ where: { key: 'locked_days' } });
    const lockedDays = lockedSetting ? JSON.parse(lockedSetting.value) : [];
    if (lockedDays.includes(dateString)) {
      res.status(400).json({ error: "Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour." });
      return;
    }

    // The debit and the order commit together: if the balance is too low the
    // whole thing rolls back and no order is left behind.
    const { order, balanceAfter } = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          serviceId: serviceId || null,
          houseConfigId: houseConfigId || null,
          categoryId: categoryId || null,
          categoryServiceId: categoryServiceId || null,
          extraWorkers: quote.workersCount,
          useMaterials: quote.materialsFlag,
          productOrigin: quote.origin,
          totalPrice: 0,
          paidWithPoints: true,
          pointsSpent: quote.total,
          scheduledDate: scheduled,
          address,
          isRapid: quote.rapid,
          latitude: latitude ? parseFloat(latitude.toString()) : null,
          longitude: longitude ? parseFloat(longitude.toString()) : null,
          sizeM2: sizeM2 ? parseFloat(sizeM2.toString()) : null,
          clientNote: clientNote || null,
          housePictures: Array.isArray(housePictures) ? housePictures : [],
          status: OrderStatus.PENDING,
        },
        include: { service: true, houseConfig: true, category: true, categoryService: true },
      });

      const movement = await applyPointMovement(
        {
          userId,
          amount: -quote.total,
          type: PointTransactionType.SPENT,
          reason: quote.label,
          orderId: created.id,
        },
        tx,
      );

      return { order: created, balanceAfter: movement.balanceAfter };
    });

    void handleOrderCreated(order.id);

    res.status(201).json({ order, points: balanceAfter });
  } catch (err) {
    fail(res, err);
  }
});

// ─── ADMIN: point pricing of the catalog ─────────────────────────────────────

// GET /api/points/store/all — the whole catalog with its point costs, including
// the services and categories that are not in the store yet.
router.get('/store/all', requireAdmin as any, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const [services, categories] = await Promise.all([
      prisma.service.findMany({
        include: { houseConfigs: { orderBy: { basePrice: 'asc' } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.category.findMany({
        include: { categoryServices: { orderBy: { basePrice: 'asc' } } },
        orderBy: { createdAt: 'asc' },
      }),
    ]);
    res.json({ services, categories });
  } catch (err) {
    fail(res, err);
  }
});

// PUT /api/points/store/services/:id — toggle a service into the point store and
// set the point cost of each of its steps. Prices in DZD are never touched here.
router.put('/store/services/:id', requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { pointStoreEnabled, houseConfigs } = req.body;

  try {
    const service = await prisma.service.findUnique({ where: { id }, include: { houseConfigs: true } });
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const configUpdates: { id: string; pointCost: number; rapidPointCost: number }[] = [];
    if (Array.isArray(houseConfigs)) {
      for (const row of houseConfigs) {
        if (!service.houseConfigs.some((hc) => hc.id === row.id)) {
          throw new PointsError('A house type does not belong to this service');
        }
        configUpdates.push({
          id: row.id,
          pointCost: readPoints(row.pointCost, 'House type point cost'),
          rapidPointCost: readPoints(row.rapidPointCost, 'Rapid point cost'),
        });
      }
    }

    const data = {
      ...(pointStoreEnabled !== undefined && { pointStoreEnabled: Boolean(pointStoreEnabled) }),
      ...(req.body.extraWorkerPointCost !== undefined && {
        extraWorkerPointCost: readPoints(req.body.extraWorkerPointCost, 'Extra worker point cost'),
      }),
      ...(req.body.rapidExtraWorkerPointCost !== undefined && {
        rapidExtraWorkerPointCost: readPoints(req.body.rapidExtraWorkerPointCost, 'Rapid extra worker point cost'),
      }),
      ...(req.body.materialPointCost !== undefined && {
        materialPointCost: readPoints(req.body.materialPointCost, 'Materials point cost'),
      }),
      ...(req.body.localProductPointCost !== undefined && {
        localProductPointCost: readPoints(req.body.localProductPointCost, 'Local products point cost'),
      }),
      ...(req.body.importedProductPointCost !== undefined && {
        importedProductPointCost: readPoints(req.body.importedProductPointCost, 'Imported products point cost'),
      }),
    };

    const updated = await prisma.$transaction(async (tx) => {
      for (const row of configUpdates) {
        await tx.houseConfig.update({
          where: { id: row.id },
          data: { pointCost: row.pointCost, rapidPointCost: row.rapidPointCost },
        });
      }
      return tx.service.update({
        where: { id },
        data,
        include: { houseConfigs: { orderBy: { basePrice: 'asc' } } },
      });
    });

    res.json(updated);
  } catch (err) {
    fail(res, err);
  }
});

// PUT /api/points/store/categories/:id — same for a category and its options.
router.put('/store/categories/:id', requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { pointStoreEnabled, categoryServices } = req.body;

  try {
    const category = await prisma.category.findUnique({ where: { id }, include: { categoryServices: true } });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const optionUpdates: { id: string; pointCost: number; rapidPointCost: number }[] = [];
    if (Array.isArray(categoryServices)) {
      for (const row of categoryServices) {
        if (!category.categoryServices.some((cs) => cs.id === row.id)) {
          throw new PointsError('An option does not belong to this category');
        }
        optionUpdates.push({
          id: row.id,
          pointCost: readPoints(row.pointCost, 'Option point cost'),
          rapidPointCost: readPoints(row.rapidPointCost, 'Rapid point cost'),
        });
      }
    }

    const data = {
      ...(pointStoreEnabled !== undefined && { pointStoreEnabled: Boolean(pointStoreEnabled) }),
      ...(req.body.materialPointCost !== undefined && {
        materialPointCost: readPoints(req.body.materialPointCost, 'Materials point cost'),
      }),
      ...(req.body.localProductPointCost !== undefined && {
        localProductPointCost: readPoints(req.body.localProductPointCost, 'Local products point cost'),
      }),
      ...(req.body.importedProductPointCost !== undefined && {
        importedProductPointCost: readPoints(req.body.importedProductPointCost, 'Imported products point cost'),
      }),
    };

    const updated = await prisma.$transaction(async (tx) => {
      for (const row of optionUpdates) {
        await tx.categoryService.update({
          where: { id: row.id },
          data: { pointCost: row.pointCost, rapidPointCost: row.rapidPointCost },
        });
      }
      return tx.category.update({
        where: { id },
        data,
        include: { categoryServices: { orderBy: { basePrice: 'asc' } } },
      });
    });

    res.json(updated);
  } catch (err) {
    fail(res, err);
  }
});

// ─── ADMIN: customer balances & history ──────────────────────────────────────

// GET /api/points/clients — every customer with their balance and totals.
router.get('/clients', requireAdmin as any, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true, fullName: true, email: true, phone: true, points: true, createdAt: true },
      orderBy: { points: 'desc' },
    });

    const earned = await prisma.pointTransaction.groupBy({
      by: ['userId'],
      where: { amount: { gt: 0 } },
      _sum: { amount: true },
    });
    const spent = await prisma.pointTransaction.groupBy({
      by: ['userId'],
      where: { amount: { lt: 0 } },
      _sum: { amount: true },
    });

    const earnedMap = new Map(earned.map((row) => [row.userId, row._sum.amount ?? 0]));
    const spentMap = new Map(spent.map((row) => [row.userId, Math.abs(row._sum.amount ?? 0)]));

    res.json(
      users.map((user) => ({
        ...user,
        totalEarned: earnedMap.get(user.id) ?? 0,
        totalSpent: spentMap.get(user.id) ?? 0,
      })),
    );
  } catch (err) {
    fail(res, err);
  }
});

// GET /api/points/transactions — recent movements across all customers.
router.get('/transactions', requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const take = Math.min(Number(req.query.limit) || 200, 500);
  try {
    const transactions = await prisma.pointTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        order: { select: { id: true, status: true, scheduledDate: true } },
      },
    });
    res.json(transactions);
  } catch (err) {
    fail(res, err);
  }
});

// GET /api/points/clients/:userId — one customer's balance and full history.
router.get('/clients/:userId', requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.userId as string;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, phone: true, points: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const transactions = await prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { order: { select: { id: true, status: true, scheduledDate: true, totalPrice: true } } },
    });

    res.json({ user, transactions });
  } catch (err) {
    fail(res, err);
  }
});

// POST /api/points/clients/:userId/adjust — manual correction.
// Body: { amount: number (signed, non-zero), reason?: string }
router.post('/clients/:userId/adjust', requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.userId as string;
  const amount = Number(req.body.amount);
  const reason = (req.body.reason || 'Manual adjustment').toString();

  try {
    const result = await applyPointMovement({
      userId,
      amount,
      type: PointTransactionType.ADJUSTED,
      reason,
      adminId: req.user?.userId ?? null,
    });

    void sendPushToUser(userId, {
      title: amount > 0 ? 'Points added' : 'Points updated',
      body: amount > 0
        ? `You received ${amount} points. New balance: ${result.balanceAfter}.`
        : `${Math.abs(amount)} points were removed. New balance: ${result.balanceAfter}.`,
      data: { type: 'points_adjusted', amount: String(amount) },
    });

    res.json({ points: result.balanceAfter, transactionId: result.transactionId });
  } catch (err) {
    fail(res, err);
  }
});

export default router;
