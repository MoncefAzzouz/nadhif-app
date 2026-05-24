import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// ─── GUARD: All admin routes require ADMIN role ─────────────────────────────
function requireAdmin(req: AuthenticatedRequest, res: Response, next: any) {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

// Apply auth + role check to all routes
router.use(authenticateToken as any);
router.use(requireAdmin as any);

// ─── USERS ───────────────────────────────────────────────────────────────────

// GET /api/admin/users — list all users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── CLEANERS ────────────────────────────────────────────────────────────────

// GET /api/admin/cleaners
router.get('/cleaners', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cleaners = await prisma.cleaner.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(cleaners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/cleaners
router.post('/cleaners', async (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phone, bio, isActive, skills } = req.body;
  if (!fullName || !phone) {
    res.status(400).json({ error: 'fullName and phone are required' });
    return;
  }
  try {
    const cleaner = await prisma.cleaner.create({
      data: { fullName, phone, bio, isActive: isActive ?? true, skills: skills || [] },
    });
    res.status(201).json(cleaner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/cleaners/:id
router.put('/cleaners/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { fullName, phone, bio, isActive, rating, skills } = req.body;
  try {
    const cleaner = await prisma.cleaner.update({
      where: { id },
      data: { fullName, phone, bio, isActive, rating, skills },
    });
    res.json(cleaner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/cleaners/:id
router.delete('/cleaners/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.cleaner.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PROMOS ──────────────────────────────────────────────────────────────────

// GET /api/admin/promos
router.get('/promos', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { validFrom: 'desc' },
    });
    res.json(promos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/promos
router.post('/promos', async (req: AuthenticatedRequest, res: Response) => {
  const { code, discountPercent, validFrom, validUntil, isActive } = req.body;
  if (!code || discountPercent == null || !validFrom || !validUntil) {
    res.status(400).json({ error: 'code, discountPercent, validFrom, validUntil are required' });
    return;
  }
  try {
    const promo = await prisma.promo.create({
      data: {
        code,
        discountPercent: parseFloat(discountPercent),
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: isActive ?? true,
      },
    });
    res.status(201).json(promo);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Promo code already exists' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/promos/:id
router.put('/promos/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { code, discountPercent, validFrom, validUntil, isActive } = req.body;
  try {
    const promo = await prisma.promo.update({
      where: { id },
      data: {
        code,
        discountPercent: discountPercent != null ? parseFloat(discountPercent) : undefined,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        isActive,
      },
    });
    res.json(promo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/promos/:id
router.delete('/promos/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.promo.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── SERVICES (Admin CRUD) ────────────────────────────────────────────────────

// POST /api/admin/services
router.post('/services', async (req: AuthenticatedRequest, res: Response) => {
  const {
    name, description, picture,
    extraWorkerPrice, durationHours,
    materialPrice, materialsMandatory,
    localProductPrice, importedProductPrice, productsMandatory,
    isActive, houseConfigs,
  } = req.body;

  if (!name || !description) {
    res.status(400).json({ error: 'name and description are required' });
    return;
  }

  try {
    const service = await prisma.service.create({
      data: {
        name,
        description,
        picture: picture || '',
        extraWorkerPrice: parseFloat(extraWorkerPrice ?? 0),
        durationHours: parseInt(durationHours ?? 4),
        materialPrice: parseFloat(materialPrice ?? 0),
        materialsMandatory: materialsMandatory ?? false,
        localProductPrice: parseFloat(localProductPrice ?? 0),
        importedProductPrice: parseFloat(importedProductPrice ?? 0),
        productsMandatory: productsMandatory ?? false,
        isActive: isActive ?? true,
        houseConfigs: houseConfigs
          ? {
              create: houseConfigs.map((hc: any) => ({
                type: hc.type,
                workers: parseInt(hc.workers),
                basePrice: parseFloat(hc.basePrice),
              })),
            }
          : undefined,
      },
      include: { houseConfigs: true },
    });
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/services/:id
router.put('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const {
    name, description, picture,
    extraWorkerPrice, durationHours,
    materialPrice, materialsMandatory,
    localProductPrice, importedProductPrice, productsMandatory,
    isActive, houseConfigs,
  } = req.body;

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        picture,
        extraWorkerPrice: extraWorkerPrice != null ? parseFloat(extraWorkerPrice) : undefined,
        durationHours: durationHours != null ? parseInt(durationHours) : undefined,
        materialPrice: materialPrice != null ? parseFloat(materialPrice) : undefined,
        materialsMandatory,
        localProductPrice: localProductPrice != null ? parseFloat(localProductPrice) : undefined,
        importedProductPrice: importedProductPrice != null ? parseFloat(importedProductPrice) : undefined,
        productsMandatory,
        isActive,
      },
    });

    if (houseConfigs && Array.isArray(houseConfigs)) {
      const existingIds = houseConfigs.filter((hc: any) => hc.id).map((hc: any) => hc.id);
      try {
        await prisma.houseConfig.deleteMany({
          where: { serviceId: id, id: { notIn: existingIds } }
        });
      } catch (e) {
        // ignore if referenced by an existing order
      }

      for (const hc of houseConfigs) {
        if (hc.id) {
          await prisma.houseConfig.update({
            where: { id: hc.id },
            data: {
              type: hc.type,
              workers: parseInt(hc.workers),
              basePrice: parseFloat(hc.basePrice),
            }
          });
        } else {
          await prisma.houseConfig.create({
            data: {
              serviceId: id,
              type: hc.type,
              workers: parseInt(hc.workers),
              basePrice: parseFloat(hc.basePrice),
            }
          });
        }
      }
    }

    const updatedService = await prisma.service.findUnique({
      where: { id },
      include: { houseConfigs: true },
    });
    res.json(updatedService);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/services/:id
router.delete('/services/:id', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.service.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// POST /api/admin/orders (Manual Order Creation)
router.post('/orders', async (req: AuthenticatedRequest, res: Response) => {
  const {
    fullName, phone, address, latitude, longitude, serviceId, houseConfigId, scheduledDate,
    extraWorkers, useMaterials, productOrigin, promoCode
  } = req.body;

  if (!phone || !address || !serviceId || !houseConfigId || !scheduledDate) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // 1. Find or create guest user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('guest123', 10);
      user = await prisma.user.create({
        data: {
          phone,
          email: `guest_${phone}_${Date.now()}@nadif.com`,
          fullName: fullName || 'Guest Customer',
          passwordHash,
          role: 'CUSTOMER'
        }
      });
    }

    // 2. Fetch service and house config
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { houseConfigs: true }
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const houseConfig = service.houseConfigs.find((hc: any) => hc.id === houseConfigId);
    if (!houseConfig) {
      res.status(404).json({ error: 'House config not found' });
      return;
    }

    // 3. Pricing Calculation
    const basePrice = houseConfig.basePrice;
    const workersCount = extraWorkers ? parseInt(extraWorkers.toString()) : 0;
    const extraWorkersPrice = workersCount * service.extraWorkerPrice;
    const materialsFlag = useMaterials === true || service.materialsMandatory;
    const materialsPrice = materialsFlag ? service.materialPrice : 0;
    
    let productsPrice = 0;
    const origin = productOrigin || 'NONE';
    if (origin === 'LOCAL') productsPrice = service.localProductPrice;
    else if (origin === 'IMPORTED') productsPrice = service.importedProductPrice;
    
    let calculatedTotal = basePrice + extraWorkersPrice + materialsPrice + productsPrice;
    let finalPromoId: string | undefined = undefined;

    // 4. Promo
    if (promoCode) {
      const promo = await prisma.promo.findUnique({ where: { code: promoCode } });
      if (promo && promo.isActive) {
        const now = new Date();
        if (now >= promo.validFrom && now <= promo.validUntil) {
          calculatedTotal = calculatedTotal * (1 - promo.discountPercent / 100);
          finalPromoId = promo.id;
        }
      }
    }

    // 5. Create Order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        serviceId,
        houseConfigId,
        status: 'PENDING',
        totalPrice: calculatedTotal,
        scheduledDate: new Date(scheduledDate),
        extraWorkers: workersCount,
        useMaterials: materialsFlag,
        productOrigin: origin,
        latitude: latitude || 0,
        longitude: longitude || 0,
        address,
        promoId: finalPromoId
      },
      include: {
        user: { select: { id: true, fullName: true, phone: true } },
        service: { select: { id: true, name: true, picture: true } },
        houseConfig: true,
        cleaner: true
      }
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
