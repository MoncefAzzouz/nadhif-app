import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { ProductOrigin, OrderStatus } from '@prisma/client';

const router = Router();

// Create new order
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  const {
    serviceId,
    houseConfigId,
    promoCode,
    extraWorkers,
    useMaterials,
    productOrigin,
    scheduledDate,
    address,
    latitude,
    longitude
  } = req.body;

  if (!serviceId || !houseConfigId || !scheduledDate || !address) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // 1. Fetch service and house config
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { houseConfigs: true }
    });

    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const houseConfig = service.houseConfigs.find(hc => hc.id === houseConfigId);
    if (!houseConfig) {
      res.status(404).json({ error: 'House config not found for this service' });
      return;
    }

    // 2. Compute dynamic base price
    const basePrice = houseConfig.basePrice;
    
    // Extra workers cost
    const workersCount = extraWorkers ? parseInt(extraWorkers.toString()) : 0;
    const extraWorkersPrice = workersCount * service.extraWorkerPrice;

    // Materials cost
    const materialsFlag = useMaterials === true || service.materialsMandatory;
    const materialsPrice = materialsFlag ? service.materialPrice : 0;

    // Products cost
    let productsPrice = 0;
    const origin = (productOrigin as ProductOrigin) || ProductOrigin.NONE;
    if (service.productsMandatory && origin === ProductOrigin.NONE) {
      res.status(400).json({ error: 'Product origin selection is mandatory for this service' });
      return;
    }

    if (origin === ProductOrigin.LOCAL) {
      productsPrice = service.localProductPrice;
    } else if (origin === ProductOrigin.IMPORTED) {
      productsPrice = service.importedProductPrice;
    }

    let calculatedTotal = basePrice + extraWorkersPrice + materialsPrice + productsPrice;

    // 3. Handle Promo Code if provided
    let promoId: string | null = null;
    if (promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: promoCode }
      });

      if (!promo || !promo.isActive) {
        res.status(400).json({ error: 'Invalid or inactive promo code' });
        return;
      }

      const now = new Date();
      if (now < promo.validFrom || now > promo.validUntil) {
        res.status(400).json({ error: 'Promo code is expired or not yet active' });
        return;
      }

      promoId = promo.id;
      calculatedTotal = calculatedTotal * (1 - promo.discountPercent / 100);
    }

    // 4. Create the Order
    const order = await prisma.order.create({
      data: {
        userId,
        serviceId,
        houseConfigId,
        promoId,
        extraWorkers: workersCount,
        useMaterials: materialsFlag,
        productOrigin: origin,
        totalPrice: calculatedTotal,
        scheduledDate: new Date(scheduledDate),
        address,
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
        status: OrderStatus.PENDING
      },
      include: {
        service: true,
        houseConfig: true,
        promo: true
      }
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get orders (customer sees their own, admin sees all)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  try {
    let orders;
    if (role === 'ADMIN') {
      orders = await prisma.order.findMany({
        include: {
          user: { select: { id: true, email: true, fullName: true, phone: true } },
          cleaner: true,
          service: true,
          houseConfig: true,
          promo: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      orders = await prisma.order.findMany({
        where: { userId },
        include: {
          cleaner: true,
          service: true,
          houseConfig: true,
          promo: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const id = req.params.id as string;

  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true, phone: true } },
        cleaner: true,
        service: true,
        houseConfig: true,
        promo: true
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Access control: customer can only see their own order
    if (role !== 'ADMIN' && order.userId !== userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (ADMIN can update anything, CUSTOMER can cancel if PENDING)
router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role;
  const id = req.params.id as string;
  const { status } = req.body;

  if (!userId || !status) {
    res.status(400).json({ error: 'Missing required status field' });
    return;
  }

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const newStatus = status as OrderStatus;

    if (role === 'ADMIN') {
      // Admin has full control
      const updated = await prisma.order.update({
        where: { id },
        data: { status: newStatus },
        include: { service: true, houseConfig: true }
      });
      res.json(updated);
      return;
    }

    if (role === 'CUSTOMER') {
      if (order.userId !== userId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      if (newStatus !== OrderStatus.CANCELLED) {
        res.status(400).json({ error: 'Customers can only cancel orders' });
        return;
      }
      if (order.status !== OrderStatus.PENDING) {
        res.status(400).json({ error: 'Orders can only be cancelled while pending' });
        return;
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: { service: true, houseConfig: true }
      });
      res.json(updated);
      return;
    }

    res.status(403).json({ error: 'Unauthorized status transition' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update an order (ADMIN only)
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role;
  const id = req.params.id as string;

  if (role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { address, scheduledDate, cleanerId, extraWorkers, useMaterials, productOrigin, totalPrice, status, latitude, longitude, serviceId, houseConfigId } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(address !== undefined && { address }),
        ...(scheduledDate !== undefined && { scheduledDate: new Date(scheduledDate) }),
        ...(cleanerId !== undefined && { cleanerId }),
        ...(extraWorkers !== undefined && { extraWorkers }),
        ...(useMaterials !== undefined && { useMaterials }),
        ...(productOrigin !== undefined && { productOrigin }),
        ...(totalPrice !== undefined && { totalPrice }),
        ...(status !== undefined && { status }),
        ...(serviceId !== undefined && { serviceId }),
        ...(houseConfigId !== undefined && { houseConfigId }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude.toString()) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude.toString()) : null }),
      },
      include: {
        user: { select: { id: true, email: true, fullName: true, phone: true } },
        cleaner: true,
        service: true,
        houseConfig: true,
        promo: true
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an order (ADMIN only)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role;
  const id = req.params.id as string;

  if (role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  try {
    await prisma.order.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
