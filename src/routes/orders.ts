import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';
import { ProductOrigin, OrderStatus } from '@prisma/client';
import { sendPushToUser } from '../lib/firebaseAdmin';

const router = Router();

// Human-friendly status text used in push notification bodies.
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'pending',
  CALLED_NOT_PAID: 'awaiting payment',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Notify the order's customer that its status changed. Fire-and-forget so it
// never blocks or fails the admin request.
function notifyOrderStatus(userId: string, orderId: string, status: string) {
  const label = STATUS_LABELS[status] ?? status.toLowerCase();
  void sendPushToUser(userId, {
    title: 'Order update',
    body: `Your order is now ${label}.`,
    data: { type: 'order_status', orderId, status },
  });
}

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
    categoryId,
    categoryServiceId,
    promoCode,
    extraWorkers,
    useMaterials,
    productOrigin,
    scheduledDate,
    address,
    latitude,
    longitude,
    sizeM2,
    clientNote,
    housePictures,
    isRapid
  } = req.body;

  if ((!serviceId && !categoryId) || (!houseConfigId && !categoryServiceId) || !scheduledDate || !address) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    let calculatedTotal = 0;
    let basePrice = 0;
    const workersCount = extraWorkers ? parseInt(extraWorkers.toString()) : 0;
    let extraWorkersPrice = 0;
    let materialsFlag = false;
    let materialsPrice = 0;
    const origin = (productOrigin as ProductOrigin) || ProductOrigin.NONE;
    let productsPrice = 0;

    if (serviceId && houseConfigId) {
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
      basePrice = (isRapid === true || isRapid === 'true') ? houseConfig.rapidBasePrice : houseConfig.basePrice;
      const extraPriceUnit = (isRapid === true || isRapid === 'true') ? (service.rapidExtraWorkerPrice ?? 0) : service.extraWorkerPrice;
      extraWorkersPrice = workersCount * extraPriceUnit;
      materialsFlag = useMaterials === true || service.materialsMandatory;
      materialsPrice = materialsFlag ? service.materialPrice : 0;

      if (service.productsMandatory && origin === ProductOrigin.NONE) {
        res.status(400).json({ error: 'Product origin selection is mandatory for this service' });
        return;
      }

      if (origin === ProductOrigin.LOCAL) {
        productsPrice = service.localProductPrice;
      } else if (origin === ProductOrigin.IMPORTED) {
        productsPrice = service.importedProductPrice;
      }

      calculatedTotal = basePrice + extraWorkersPrice + materialsPrice + productsPrice;
    } else if (categoryId && categoryServiceId) {
      // 1. Fetch category and category service
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { categoryServices: true }
      });

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      const categoryService = category.categoryServices.find(cs => cs.id === categoryServiceId);
      if (!categoryService) {
        res.status(404).json({ error: 'Category service not found' });
        return;
      }

      // 2. Compute category base price
      basePrice = (isRapid === true || isRapid === 'true') ? categoryService.rapidBasePrice : categoryService.basePrice;
      materialsFlag = useMaterials === true || category.materialsMandatory;
      materialsPrice = materialsFlag ? category.materialPrice : 0;

      if (category.productsMandatory && origin === ProductOrigin.NONE) {
        res.status(400).json({ error: 'Product origin selection is mandatory for this category' });
        return;
      }

      if (origin === ProductOrigin.LOCAL) {
        productsPrice = category.localProductPrice;
      } else if (origin === ProductOrigin.IMPORTED) {
        productsPrice = category.importedProductPrice;
      }

      calculatedTotal = basePrice + materialsPrice + productsPrice;
    }

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

    // Check if scheduled date falls on a locked day
    const scheduled = new Date(scheduledDate);
    const offset = scheduled.getTimezoneOffset();
    const localDate = new Date(scheduled.getTime() - offset * 60 * 1000);
    const dateString = localDate.toISOString().slice(0, 10); // YYYY-MM-DD

    const lockedSetting = await prisma.appSetting.findUnique({ where: { key: 'locked_days' } });
    const lockedDays = lockedSetting ? JSON.parse(lockedSetting.value) : [];
    if (lockedDays.includes(dateString)) {
      res.status(400).json({ error: "Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour." });
      return;
    }

    // 4. Create the Order
    const order = await prisma.order.create({
      data: {
        userId,
        serviceId: serviceId || null,
        houseConfigId: houseConfigId || null,
        categoryId: categoryId || null,
        categoryServiceId: categoryServiceId || null,
        promoId,
        extraWorkers: workersCount,
        useMaterials: materialsFlag,
        productOrigin: origin,
        totalPrice: calculatedTotal,
        scheduledDate: new Date(scheduledDate),
        address,
        isRapid: isRapid === true || isRapid === 'true',
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
        status: OrderStatus.PENDING,
        sizeM2: sizeM2 ? parseFloat(sizeM2.toString()) : null,
        clientNote: clientNote || null,
        housePictures: Array.isArray(housePictures) ? housePictures : []
      },
      include: {
        service: true,
        houseConfig: true,
        category: true,
        categoryService: true,
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
          category: true,
          categoryService: true,
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
          category: true,
          categoryService: true,
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

// Get cleaner availability for a given date
router.get('/availability', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const {
    date,
    serviceId,
    houseConfigId,
    categoryId,
    categoryServiceId,
    extraWorkers,
    isRapid
  } = req.query;

  if (!date) {
    res.status(400).json({ error: 'Missing date parameter' });
    return;
  }

  try {
    const dateString = date as string;
    const workersCount = extraWorkers ? parseInt(extraWorkers.toString(), 10) : 0;
    const rapidFlag = isRapid === 'true';

    let requiredWorkers = 1;
    let durationHours = 3;

    if (serviceId && houseConfigId) {
      const houseConfig = await prisma.houseConfig.findUnique({
        where: { id: houseConfigId as string }
      });
      if (houseConfig) {
        requiredWorkers = houseConfig.workers + workersCount;
        durationHours = houseConfig.durationHours;
      }
    } else if (categoryId && categoryServiceId) {
      const categoryService = await prisma.categoryService.findUnique({
        where: { id: categoryServiceId as string }
      });
      if (categoryService) {
        requiredWorkers = categoryService.workers; // fixed by admin
        durationHours = categoryService.durationHours;
      }
    }

    // List all active cleaners
    const cleaners = await prisma.cleaner.findMany({
      where: { isActive: true }
    });
    const totalActiveCleaners = cleaners.length;

    // Fetch all active orders around this date (within a 2-day window to cover timezone / overlaps)
    const startOfDay = new Date(`${dateString}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateString}T23:59:59.999Z`);
    const minDate = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
    const maxDate = new Date(endOfDay.getTime() + 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        scheduledDate: {
          gte: minDate,
          lte: maxDate
        },
        cleanerId: { not: null }
      },
      include: {
        houseConfig: true,
        categoryService: true,
        service: true
      }
    });

    // Fetch all active subscription sessions around this date
    const sessions = await prisma.subscriptionSession.findMany({
      where: {
        status: { not: 'CANCELLED' },
        scheduledDate: {
          gte: minDate,
          lte: maxDate
        },
        cleanerId: { not: null }
      }
    });

    // Helper to get local time representation on Node.js
    const getLocalTimeMs = (d: Date): number => {
      const offset = d.getTimezoneOffset();
      return d.getTime() - offset * 60 * 1000;
    };

    // We check availability for these standard slots
    const timeSlots = [
      "08:00", "09:00", "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
    ];

    const availableSlots: string[] = [];

    timeSlots.forEach(timeStr => {
      const slotStart = new Date(`${dateString}T${timeStr}:00.000Z`).getTime();
      const slotEnd = slotStart + durationHours * 60 * 60 * 1000;

      const busyCleanerIds = new Set<string>();

      // Check order overlaps
      orders.forEach(other => {
        if (!other.cleanerId) return;
        const otherStart = getLocalTimeMs(other.scheduledDate);
        const otherDuration = other.houseConfig?.durationHours ?? other.categoryService?.durationHours ?? other.service?.durationHours ?? 3;
        const otherEnd = otherStart + otherDuration * 60 * 60 * 1000;

        if (slotStart < otherEnd && otherStart < slotEnd) {
          other.cleanerId.split(',').forEach(cid => {
            const trimmed = cid.trim();
            if (trimmed) busyCleanerIds.add(trimmed);
          });
        }
      });

      // Check session overlaps
      sessions.forEach(session => {
        if (!session.cleanerId) return;
        const sessionStart = getLocalTimeMs(session.scheduledDate);
        const sessionEnd = sessionStart + session.durationHours * 60 * 60 * 1000;

        if (slotStart < sessionEnd && sessionStart < slotEnd) {
          session.cleanerId.split(',').forEach(cid => {
            const trimmed = cid.trim();
            if (trimmed) busyCleanerIds.add(trimmed);
          });
        }
      });

      const availableCount = totalActiveCleaners - busyCleanerIds.size;
      if (availableCount >= requiredWorkers) {
        availableSlots.push(timeStr);
      }
    });

    res.json({
      date: dateString,
      requiredWorkers,
      durationHours,
      availableSlots
    });
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
        category: true,
        categoryService: true,
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
      const dataToUpdate: any = { status: newStatus };
      if (newStatus === OrderStatus.PENDING || newStatus === OrderStatus.CALLED_NOT_PAID) {
        dataToUpdate.cleanerId = null;
      }
      const updated = await prisma.order.update({
        where: { id },
        data: dataToUpdate,
        include: { service: true, houseConfig: true, category: true, categoryService: true }
      });
      if (order.status !== newStatus) {
        notifyOrderStatus(order.userId, id, newStatus);
      }
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
      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CALLED_NOT_PAID) {
        res.status(400).json({ error: 'Orders can only be cancelled while pending or called but unpaid' });
        return;
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: { service: true, houseConfig: true, category: true, categoryService: true }
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

  const { address, scheduledDate, cleanerId, extraWorkers, useMaterials, productOrigin, totalPrice, status, latitude, longitude, serviceId, houseConfigId, categoryId, categoryServiceId, sizeM2, clientNote, housePictures, isRapid } = req.body;

  try {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (scheduledDate !== undefined) {
      const scheduled = new Date(scheduledDate);
      const offset = scheduled.getTimezoneOffset();
      const localDate = new Date(scheduled.getTime() - offset * 60 * 1000);
      const dateString = localDate.toISOString().slice(0, 10); // YYYY-MM-DD

      const lockedSetting = await prisma.appSetting.findUnique({ where: { key: 'locked_days' } });
      const lockedDays = lockedSetting ? JSON.parse(lockedSetting.value) : [];
      if (lockedDays.includes(dateString)) {
        res.status(400).json({ error: "Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour." });
        return;
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(address !== undefined && { address }),
        ...(isRapid !== undefined && { isRapid: isRapid === true || isRapid === 'true' }),
        ...(scheduledDate !== undefined && { scheduledDate: new Date(scheduledDate) }),
        cleanerId: (status === 'PENDING' || status === 'CALLED_NOT_PAID') 
          ? null 
          : (cleanerId !== undefined ? cleanerId : undefined),
        ...(extraWorkers !== undefined && { extraWorkers }),
        ...(useMaterials !== undefined && { useMaterials }),
        ...(productOrigin !== undefined && { productOrigin }),
        ...(totalPrice !== undefined && { totalPrice }),
        ...(status !== undefined && { status }),
        ...(serviceId !== undefined && { serviceId }),
        ...(houseConfigId !== undefined && { houseConfigId }),
        ...(categoryId !== undefined && { categoryId }),
        ...(categoryServiceId !== undefined && { categoryServiceId }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude.toString()) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude.toString()) : null }),
        ...(sizeM2 !== undefined && { sizeM2: sizeM2 ? parseFloat(sizeM2.toString()) : null }),
        ...(clientNote !== undefined && { clientNote: clientNote || null }),
        ...(housePictures !== undefined && { housePictures: Array.isArray(housePictures) ? housePictures : [] }),
      },
      include: {
        user: { select: { id: true, email: true, fullName: true, phone: true } },
        cleaner: true,
        service: true,
        houseConfig: true,
        category: true,
        categoryService: true,
        promo: true
      }
    });

    if (status !== undefined && status !== order.status) {
      notifyOrderStatus(order.userId, id, status);
    }

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
