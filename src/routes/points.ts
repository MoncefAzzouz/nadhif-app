import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { OrderStatus, PointTransactionType } from '@prisma/client';
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

// What a store item exposes to the app: enough to render a card and to know
// which service the redeemed order will be for.
const storeItemInclude = {
  service: { select: { id: true, name: true, nameAr: true, nameFr: true, picture: true } },
  houseConfig: { select: { id: true, type: true, typeAr: true, typeFr: true, workers: true, durationHours: true } },
  category: { select: { id: true, name: true, nameAr: true, nameFr: true, picture: true } },
  categoryService: { select: { id: true, name: true, nameAr: true, nameFr: true, workers: true, durationHours: true } },
} as const;

// ─── MOBILE: the signed-in customer ──────────────────────────────────────────

// GET /api/points/me — balance + full history of the logged-in customer.
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
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
      include: {
        storeItem: { select: { id: true, name: true, nameAr: true, nameFr: true } },
        order: { select: { id: true, scheduledDate: true, status: true } },
      },
    });

    res.json({ points: user.points, transactions });
  } catch (err) {
    fail(res, err);
  }
});

// GET /api/points/store — items the customer can redeem right now.
router.get('/store', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.pointStoreItem.findMany({
      where: { isActive: true },
      orderBy: { pointCost: 'asc' },
      include: storeItemInclude,
    });
    res.json(items);
  } catch (err) {
    fail(res, err);
  }
});

// POST /api/points/redeem — spend points on a store item.
// Body: { storeItemId, scheduledDate, address, latitude?, longitude?, clientNote?, housePictures?, sizeM2? }
// Creates a normal PENDING order flagged `paidWithPoints`, so the team fulfils
// it exactly like a paid one and the admin list shows points instead of a price.
router.post('/redeem', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  const { storeItemId, scheduledDate, address, latitude, longitude, clientNote, housePictures, sizeM2 } = req.body;

  if (!storeItemId || !scheduledDate || !address) {
    res.status(400).json({ error: 'Missing required fields: storeItemId, scheduledDate, address' });
    return;
  }

  try {
    const item = await prisma.pointStoreItem.findUnique({ where: { id: storeItemId } });
    if (!item || !item.isActive) {
      res.status(404).json({ error: 'This reward is not available' });
      return;
    }

    // Same locked-day rule as a normal order.
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

    // The debit and the order are written together: if the balance is too low
    // the whole thing rolls back and no order is left behind.
    const { order, balanceAfter } = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          serviceId: item.serviceId,
          houseConfigId: item.houseConfigId,
          categoryId: item.categoryId,
          categoryServiceId: item.categoryServiceId,
          totalPrice: 0,
          paidWithPoints: true,
          pointsSpent: item.pointCost,
          pointStoreItemId: item.id,
          scheduledDate: scheduled,
          address,
          latitude: latitude ? parseFloat(latitude.toString()) : null,
          longitude: longitude ? parseFloat(longitude.toString()) : null,
          sizeM2: sizeM2 ? parseFloat(sizeM2.toString()) : null,
          clientNote: clientNote || null,
          housePictures: Array.isArray(housePictures) ? housePictures : [],
          status: OrderStatus.PENDING,
        },
        include: { service: true, houseConfig: true, category: true, categoryService: true, pointStoreItem: true },
      });

      const movement = await applyPointMovement(
        {
          userId,
          amount: -item.pointCost,
          type: PointTransactionType.SPENT,
          reason: item.name,
          orderId: created.id,
          storeItemId: item.id,
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

// ─── ADMIN: point store management ───────────────────────────────────────────

// GET /api/points/store/all — every item, including the disabled ones.
router.get('/store/all', requireAdmin as any, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.pointStoreItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { ...storeItemInclude, _count: { select: { orders: true } } },
    });
    res.json(items);
  } catch (err) {
    fail(res, err);
  }
});

function readStoreItemBody(body: any) {
  const pointCost = Number(body.pointCost);
  if (!body.name || !String(body.name).trim()) throw new PointsError('Name is required');
  if (!Number.isInteger(pointCost) || pointCost <= 0) throw new PointsError('Point cost must be a whole number above zero');

  const serviceId = body.serviceId || null;
  const houseConfigId = body.houseConfigId || null;
  const categoryId = body.categoryId || null;
  const categoryServiceId = body.categoryServiceId || null;

  // An item must resolve to something the team can actually perform.
  const isService = Boolean(serviceId && houseConfigId);
  const isCategory = Boolean(categoryId && categoryServiceId);
  if (!isService && !isCategory) {
    throw new PointsError('Pick a service with its house type, or a category with its service');
  }
  if (isService && isCategory) {
    throw new PointsError('Pick either a service or a category, not both');
  }

  return {
    name: String(body.name).trim(),
    nameAr: body.nameAr ?? '',
    nameFr: body.nameFr ?? '',
    description: body.description ?? '',
    descriptionAr: body.descriptionAr ?? '',
    descriptionFr: body.descriptionFr ?? '',
    picture: body.picture ?? '',
    pointCost,
    serviceId: isService ? serviceId : null,
    houseConfigId: isService ? houseConfigId : null,
    categoryId: isCategory ? categoryId : null,
    categoryServiceId: isCategory ? categoryServiceId : null,
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}

// POST /api/points/store — create an item.
router.post('/store', requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await prisma.pointStoreItem.create({
      data: readStoreItemBody(req.body),
      include: storeItemInclude,
    });
    res.status(201).json(item);
  } catch (err) {
    fail(res, err);
  }
});

// PUT /api/points/store/:id — update an item.
router.put('/store/:id', requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = await prisma.pointStoreItem.update({
      where: { id: req.params.id as string },
      data: readStoreItemBody(req.body),
      include: storeItemInclude,
    });
    res.json(item);
  } catch (err) {
    fail(res, err);
  }
});

// DELETE /api/points/store/:id — remove an item. Items already redeemed are
// disabled instead of deleted so past orders keep pointing at something.
router.delete('/store/:id', requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    const usage = await prisma.order.count({ where: { pointStoreItemId: id } });
    if (usage > 0) {
      const item = await prisma.pointStoreItem.update({ where: { id }, data: { isActive: false } });
      res.json({ success: true, deactivated: true, item });
      return;
    }
    await prisma.pointStoreItem.delete({ where: { id } });
    res.json({ success: true, deactivated: false });
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

    // Lifetime earned/spent per customer, in one grouped query.
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
        storeItem: { select: { id: true, name: true } },
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
      include: {
        storeItem: { select: { id: true, name: true } },
        order: { select: { id: true, status: true, scheduledDate: true, totalPrice: true } },
      },
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

    // Tell the customer their balance moved.
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
