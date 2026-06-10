"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Create new order
router.post('/', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'User unauthorized' });
        return;
    }
    const { serviceId, houseConfigId, categoryId, categoryServiceId, promoCode, extraWorkers, useMaterials, productOrigin, scheduledDate, address, latitude, longitude } = req.body;
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
        const origin = productOrigin || client_1.ProductOrigin.NONE;
        let productsPrice = 0;
        if (serviceId && houseConfigId) {
            // 1. Fetch service and house config
            const service = await prisma_1.default.service.findUnique({
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
            basePrice = houseConfig.basePrice;
            extraWorkersPrice = workersCount * service.extraWorkerPrice;
            materialsFlag = useMaterials === true || service.materialsMandatory;
            materialsPrice = materialsFlag ? service.materialPrice : 0;
            if (service.productsMandatory && origin === client_1.ProductOrigin.NONE) {
                res.status(400).json({ error: 'Product origin selection is mandatory for this service' });
                return;
            }
            if (origin === client_1.ProductOrigin.LOCAL) {
                productsPrice = service.localProductPrice;
            }
            else if (origin === client_1.ProductOrigin.IMPORTED) {
                productsPrice = service.importedProductPrice;
            }
            calculatedTotal = basePrice + extraWorkersPrice + materialsPrice + productsPrice;
        }
        else if (categoryId && categoryServiceId) {
            // 1. Fetch category and category service
            const category = await prisma_1.default.category.findUnique({
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
            basePrice = categoryService.basePrice;
            materialsFlag = useMaterials === true || category.materialsMandatory;
            materialsPrice = materialsFlag ? category.materialPrice : 0;
            if (category.productsMandatory && origin === client_1.ProductOrigin.NONE) {
                res.status(400).json({ error: 'Product origin selection is mandatory for this category' });
                return;
            }
            if (origin === client_1.ProductOrigin.LOCAL) {
                productsPrice = category.localProductPrice;
            }
            else if (origin === client_1.ProductOrigin.IMPORTED) {
                productsPrice = category.importedProductPrice;
            }
            calculatedTotal = basePrice + materialsPrice + productsPrice;
        }
        // 3. Handle Promo Code if provided
        let promoId = null;
        if (promoCode) {
            const promo = await prisma_1.default.promo.findUnique({
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
        const lockedSetting = await prisma_1.default.appSetting.findUnique({ where: { key: 'locked_days' } });
        const lockedDays = lockedSetting ? JSON.parse(lockedSetting.value) : [];
        if (lockedDays.includes(dateString)) {
            res.status(400).json({ error: "Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour." });
            return;
        }
        // 4. Create the Order
        const order = await prisma_1.default.order.create({
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
                latitude: latitude ? parseFloat(latitude.toString()) : null,
                longitude: longitude ? parseFloat(longitude.toString()) : null,
                status: client_1.OrderStatus.PENDING
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get orders (customer sees their own, admin sees all)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) {
        res.status(401).json({ error: 'User unauthorized' });
        return;
    }
    try {
        let orders;
        if (role === 'ADMIN') {
            orders = await prisma_1.default.order.findMany({
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
        }
        else {
            orders = await prisma_1.default.order.findMany({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get single order by ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const id = req.params.id;
    if (!userId) {
        res.status(401).json({ error: 'User unauthorized' });
        return;
    }
    try {
        const order = await prisma_1.default.order.findUnique({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Update order status (ADMIN can update anything, CUSTOMER can cancel if PENDING)
router.patch('/:id/status', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const id = req.params.id;
    const { status } = req.body;
    if (!userId || !status) {
        res.status(400).json({ error: 'Missing required status field' });
        return;
    }
    try {
        const order = await prisma_1.default.order.findUnique({ where: { id } });
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        const newStatus = status;
        if (role === 'ADMIN') {
            // Admin has full control
            const updated = await prisma_1.default.order.update({
                where: { id },
                data: { status: newStatus },
                include: { service: true, houseConfig: true, category: true, categoryService: true }
            });
            res.json(updated);
            return;
        }
        if (role === 'CUSTOMER') {
            if (order.userId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            if (newStatus !== client_1.OrderStatus.CANCELLED) {
                res.status(400).json({ error: 'Customers can only cancel orders' });
                return;
            }
            if (order.status !== client_1.OrderStatus.PENDING) {
                res.status(400).json({ error: 'Orders can only be cancelled while pending' });
                return;
            }
            const updated = await prisma_1.default.order.update({
                where: { id },
                data: { status: client_1.OrderStatus.CANCELLED },
                include: { service: true, houseConfig: true, category: true, categoryService: true }
            });
            res.json(updated);
            return;
        }
        res.status(403).json({ error: 'Unauthorized status transition' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Update an order (ADMIN only)
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    const role = req.user?.role;
    const id = req.params.id;
    if (role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    const { address, scheduledDate, cleanerId, extraWorkers, useMaterials, productOrigin, totalPrice, status, latitude, longitude, serviceId, houseConfigId, categoryId, categoryServiceId } = req.body;
    try {
        const order = await prisma_1.default.order.findUnique({ where: { id } });
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        if (scheduledDate !== undefined) {
            const scheduled = new Date(scheduledDate);
            const offset = scheduled.getTimezoneOffset();
            const localDate = new Date(scheduled.getTime() - offset * 60 * 1000);
            const dateString = localDate.toISOString().slice(0, 10); // YYYY-MM-DD
            const lockedSetting = await prisma_1.default.appSetting.findUnique({ where: { key: 'locked_days' } });
            const lockedDays = lockedSetting ? JSON.parse(lockedSetting.value) : [];
            if (lockedDays.includes(dateString)) {
                res.status(400).json({ error: "Cette date est verrouillée par l'administrateur. Veuillez choisir un autre jour." });
                return;
            }
        }
        const updated = await prisma_1.default.order.update({
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
                ...(categoryId !== undefined && { categoryId }),
                ...(categoryServiceId !== undefined && { categoryServiceId }),
                ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude.toString()) : null }),
                ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude.toString()) : null }),
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
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Delete an order (ADMIN only)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    const role = req.user?.role;
    const id = req.params.id;
    if (role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }
    try {
        await prisma_1.default.order.delete({
            where: { id }
        });
        res.json({ success: true, message: 'Order deleted successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
