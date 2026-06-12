"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const client_1 = require("@prisma/client");
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
const router = (0, express_1.Router)();
// ─── Subscription include shape ──────────────────────────────────────────────
const subscriptionInclude = {
    user: { select: { id: true, fullName: true, phone: true, email: true } },
    propertyType: true,
    serviceTier: true,
    sessions: {
        include: { cleaner: true },
        orderBy: { scheduledDate: 'asc' },
    },
    payments: { orderBy: { createdAt: 'desc' } },
};
// ─── SUBSCRIPTION PROPERTY TYPES CRUD ──────────────────────────────────────────
// GET all property types
router.get('/property-types', auth_1.authenticateToken, async (req, res) => {
    try {
        const propertyTypes = await prisma_1.default.subscriptionPropertyType.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(propertyTypes);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST create property type (Admin)
router.post('/property-types', auth_1.authenticateToken, async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const { name, nameAr, nameFr, picture, isActive } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    try {
        const created = await prisma_1.default.subscriptionPropertyType.create({
            data: {
                name,
                nameAr: nameAr || '',
                nameFr: nameFr || '',
                picture: picture || '',
                isActive: isActive !== undefined ? !!isActive : true,
            },
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT update property type (Admin)
router.put('/property-types/:id', auth_1.authenticateToken, async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const id = req.params.id;
    const { name, nameAr, nameFr, picture, isActive } = req.body;
    try {
        const updated = await prisma_1.default.subscriptionPropertyType.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(nameAr !== undefined && { nameAr }),
                ...(nameFr !== undefined && { nameFr }),
                ...(picture !== undefined && { picture }),
                ...(isActive !== undefined && { isActive: !!isActive }),
            },
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE property type (Admin)
router.delete('/property-types/:id', auth_1.authenticateToken, async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const id = req.params.id;
    try {
        await prisma_1.default.subscriptionPropertyType.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── SUBSCRIPTION SERVICE TIERS CRUD ──────────────────────────────────────────
// GET all service tiers
router.get('/service-tiers', auth_1.authenticateToken, async (req, res) => {
    try {
        const serviceTiers = await prisma_1.default.subscriptionServiceTier.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(serviceTiers);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST create service tier (Admin)
router.post('/service-tiers', auth_1.authenticateToken, async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const { name, nameAr, nameFr, description, durationHours, workers, isActive } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    try {
        const created = await prisma_1.default.subscriptionServiceTier.create({
            data: {
                name,
                nameAr: nameAr || '',
                nameFr: nameFr || '',
                description: description || '',
                durationHours: durationHours !== undefined ? parseInt(durationHours.toString()) : 3,
                workers: workers !== undefined ? parseInt(workers.toString()) : 1,
                isActive: isActive !== undefined ? !!isActive : true,
            },
        });
        res.status(201).json(created);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT update service tier (Admin)
router.put('/service-tiers/:id', auth_1.authenticateToken, async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const id = req.params.id;
    const { name, nameAr, nameFr, description, durationHours, workers, isActive } = req.body;
    try {
        const updated = await prisma_1.default.subscriptionServiceTier.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(nameAr !== undefined && { nameAr }),
                ...(nameFr !== undefined && { nameFr }),
                ...(description !== undefined && { description }),
                ...(durationHours !== undefined && { durationHours: parseInt(durationHours.toString()) }),
                ...(workers !== undefined && { workers: parseInt(workers.toString()) }),
                ...(isActive !== undefined && { isActive: !!isActive }),
            },
        });
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE service tier (Admin)
router.delete('/service-tiers/:id', auth_1.authenticateToken, async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const id = req.params.id;
    try {
        await prisma_1.default.subscriptionServiceTier.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── CREATE SUBSCRIPTION (Mobile client or Admin) ────────────────────────────
router.post('/', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const { fullName, phone, propertyTypeId, surfaceM2, roomsToClean, pictures, address, latitude, longitude, serviceTierId, daysPerWeek } = req.body;
    if (!propertyTypeId || !surfaceM2 || !roomsToClean || !serviceTierId || !daysPerWeek) {
        res.status(400).json({ error: 'Missing required fields: propertyTypeId, surfaceM2, roomsToClean, serviceTierId, daysPerWeek' });
        return;
    }
    try {
        // If customer, use their own data; if admin, use provided data
        let subUserId = null;
        let subFullName = fullName || '';
        let subPhone = phone || '';
        if (role === 'CUSTOMER' && userId) {
            const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
            if (user) {
                subUserId = user.id;
                subFullName = subFullName || user.fullName;
                subPhone = subPhone || user.phone;
            }
        }
        else if (role === 'ADMIN' && phone) {
            // Try to find existing user by phone
            const user = await prisma_1.default.user.findUnique({ where: { phone } });
            if (user)
                subUserId = user.id;
        }
        if (!subFullName || !subPhone) {
            res.status(400).json({ error: 'fullName and phone are required' });
            return;
        }
        const subscription = await prisma_1.default.subscription.create({
            data: {
                userId: subUserId,
                fullName: subFullName,
                phone: subPhone,
                propertyTypeId,
                surfaceM2: parseFloat(surfaceM2.toString()),
                roomsToClean: parseInt(roomsToClean.toString()),
                pictures: Array.isArray(pictures) ? pictures : [],
                address: address || '',
                latitude: latitude ? parseFloat(latitude.toString()) : null,
                longitude: longitude ? parseFloat(longitude.toString()) : null,
                serviceTierId,
                daysPerWeek: parseInt(daysPerWeek.toString()),
                status: client_1.SubscriptionStatus.PENDING,
            },
            include: subscriptionInclude,
        });
        res.status(201).json(subscription);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── GET ALL SUBSCRIPTIONS ───────────────────────────────────────────────────
router.get('/', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        let subscriptions;
        if (role === 'ADMIN') {
            subscriptions = await prisma_1.default.subscription.findMany({
                include: subscriptionInclude,
                orderBy: { createdAt: 'desc' },
            });
        }
        else {
            subscriptions = await prisma_1.default.subscription.findMany({
                where: { userId },
                include: subscriptionInclude,
                orderBy: { createdAt: 'desc' },
            });
        }
        res.json(subscriptions);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── GET SINGLE SUBSCRIPTION ────────────────────────────────────────────────
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const id = req.params.id;
    try {
        const subscription = await prisma_1.default.subscription.findUnique({
            where: { id },
            include: subscriptionInclude,
        });
        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        if (role !== 'ADMIN' && subscription.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        res.json(subscription);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── UPDATE SUBSCRIPTION (Admin) ────────────────────────────────────────────
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    const role = req.user?.role;
    const id = req.params.id;
    if (role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const { monthlyPrice, amountPaid, adminNote, status, daysPerWeek } = req.body;
    try {
        const existing = await prisma_1.default.subscription.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        const updated = await prisma_1.default.subscription.update({
            where: { id },
            data: {
                ...(monthlyPrice !== undefined && { monthlyPrice: parseFloat(monthlyPrice.toString()) }),
                ...(amountPaid !== undefined && { amountPaid: parseFloat(amountPaid.toString()) }),
                ...(adminNote !== undefined && { adminNote }),
                ...(status !== undefined && { status: status }),
                ...(daysPerWeek !== undefined && { daysPerWeek: parseInt(daysPerWeek.toString()) }),
            },
            include: subscriptionInclude,
        });
        // Notify user on status change
        if (status && status !== existing.status && existing.userId) {
            const label = status.toLowerCase().replace(/_/g, ' ');
            void (0, firebaseAdmin_1.sendPushToUser)(existing.userId, {
                title: 'Subscription update',
                body: `Your subscription is now ${label}.`,
                data: { type: 'subscription_status', subscriptionId: id, status },
            });
        }
        res.json(updated);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── DELETE SUBSCRIPTION (Admin) ────────────────────────────────────────────
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    const role = req.user?.role;
    const id = req.params.id;
    if (role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    try {
        await prisma_1.default.subscription.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── GET AVAILABLE DAYS (Admin) ─────────────────────────────────────────────
// Returns available days for the next 4 weeks, considering locked days and cleaner availability.
router.get('/:id/available-days', auth_1.authenticateToken, async (req, res) => {
    const role = req.user?.role;
    const id = req.params.id;
    if (role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    try {
        const subscription = await prisma_1.default.subscription.findUnique({
            where: { id },
            include: { serviceTier: true },
        });
        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        // Get locked days
        const lockedSetting = await prisma_1.default.appSetting.findUnique({ where: { key: 'locked_days' } });
        const lockedDays = lockedSetting ? JSON.parse(lockedSetting.value) : [];
        // Get all active cleaners
        const activeCleaners = await prisma_1.default.cleaner.findMany({ where: { isActive: true } });
        // Get all orders and subscription sessions in the next 4 weeks
        const now = new Date();
        const fourWeeksLater = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);
        const orders = await prisma_1.default.order.findMany({
            where: {
                scheduledDate: { gte: now, lte: fourWeeksLater },
                status: { notIn: ['CANCELLED'] },
                cleanerId: { not: null },
            },
            include: { service: true, houseConfig: true, categoryService: true },
        });
        const existingSessions = await prisma_1.default.subscriptionSession.findMany({
            where: {
                scheduledDate: { gte: now, lte: fourWeeksLater },
                status: { not: 'CANCELLED' },
                subscriptionId: { not: id }, // Exclude this subscription's own sessions
            },
        });
        const durationHours = subscription.serviceTier?.durationHours ?? 3;
        const workersNeeded = subscription.serviceTier?.workers ?? 1;
        // Check each day of the next 4 weeks
        const weeks = [];
        for (let w = 0; w < 4; w++) {
            const weekDays = [];
            for (let d = 0; d < 7; d++) {
                const dayOffset = w * 7 + d;
                const date = new Date(now);
                date.setDate(date.getDate() + dayOffset + 1); // Start from tomorrow
                date.setHours(8, 0, 0, 0); // Use 8 AM as reference time
                const dateStr = date.toISOString().slice(0, 10);
                const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
                // Check if day is locked
                if (lockedDays.includes(dateStr)) {
                    weekDays.push({ date: dateStr, dayName, availableCleanerCount: 0, isAvailable: false, isLocked: true });
                    continue;
                }
                // Count available cleaners for a standard working window (8h-17h)
                // Check each cleaner's availability across possible time slots
                let maxAvailable = 0;
                // Check several time slots (8:00, 9:00, 10:00, ... 14:00)
                for (let hour = 8; hour <= 14; hour++) {
                    const slotStart = new Date(date);
                    slotStart.setHours(hour, 0, 0, 0);
                    const slotEnd = new Date(slotStart.getTime() + durationHours * 60 * 60 * 1000);
                    const busyCleanerIds = new Set();
                    // Check orders
                    orders.forEach(order => {
                        if (!order.cleanerId)
                            return;
                        const orderStart = new Date(order.scheduledDate).getTime();
                        const orderDuration = order.houseConfig?.durationHours ?? order.categoryService?.durationHours ?? order.service?.durationHours ?? 3;
                        const orderEnd = orderStart + orderDuration * 60 * 60 * 1000;
                        if (slotStart.getTime() < orderEnd && orderStart < slotEnd.getTime()) {
                            order.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid.trim()));
                        }
                    });
                    // Check existing subscription sessions
                    existingSessions.forEach(session => {
                        if (!session.cleanerId)
                            return;
                        const sessionStart = new Date(session.scheduledDate).getTime();
                        const sessionEnd = sessionStart + session.durationHours * 60 * 60 * 1000;
                        if (slotStart.getTime() < sessionEnd && sessionStart < slotEnd.getTime()) {
                            session.cleanerId.split(',').forEach(cid => busyCleanerIds.add(cid.trim()));
                        }
                    });
                    const available = activeCleaners.filter(c => !busyCleanerIds.has(c.id)).length;
                    if (available > maxAvailable)
                        maxAvailable = available;
                }
                weekDays.push({
                    date: dateStr,
                    dayName,
                    availableCleanerCount: maxAvailable,
                    isAvailable: maxAvailable >= workersNeeded,
                    isLocked: false,
                });
            }
            weeks.push({ week: w + 1, days: weekDays });
        }
        res.json({
            subscriptionId: id,
            daysPerWeek: subscription.daysPerWeek,
            workersNeeded,
            durationHours,
            weeks,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── CREATE/REPLACE SESSIONS (Admin) ────────────────────────────────────────
// Accepts an array of sessions: [{ scheduledDate, durationHours, cleanerId }]
router.post('/:id/sessions', auth_1.authenticateToken, async (req, res) => {
    const role = req.user?.role;
    const id = req.params.id;
    if (role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const { sessions } = req.body;
    if (!Array.isArray(sessions) || sessions.length === 0) {
        res.status(400).json({ error: 'sessions array is required and must not be empty' });
        return;
    }
    try {
        const subscription = await prisma_1.default.subscription.findUnique({ where: { id } });
        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        // Delete existing sessions for this subscription
        await prisma_1.default.subscriptionSession.deleteMany({ where: { subscriptionId: id } });
        // Create new sessions
        const created = await Promise.all(sessions.map((s) => prisma_1.default.subscriptionSession.create({
            data: {
                subscriptionId: id,
                scheduledDate: new Date(s.scheduledDate),
                durationHours: parseInt(s.durationHours?.toString() ?? '3'),
                cleanerId: s.cleanerId || null,
                status: 'SCHEDULED',
            },
            include: { cleaner: true },
        })));
        res.json(created);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── RECORD PAYMENT (Admin) ─────────────────────────────────────────────────
router.post('/:id/payments', auth_1.authenticateToken, async (req, res) => {
    const role = req.user?.role;
    const id = req.params.id;
    if (role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const { amount, note } = req.body;
    if (!amount || parseFloat(amount.toString()) <= 0) {
        res.status(400).json({ error: 'A positive amount is required' });
        return;
    }
    try {
        const subscription = await prisma_1.default.subscription.findUnique({ where: { id } });
        if (!subscription) {
            res.status(404).json({ error: 'Subscription not found' });
            return;
        }
        const paymentAmount = parseFloat(amount.toString());
        // Create payment record
        const payment = await prisma_1.default.subscriptionPayment.create({
            data: {
                subscriptionId: id,
                amount: paymentAmount,
                note: note || null,
            },
        });
        // Update running total on subscription
        await prisma_1.default.subscription.update({
            where: { id },
            data: {
                amountPaid: { increment: paymentAmount },
            },
        });
        // Return updated subscription
        const updated = await prisma_1.default.subscription.findUnique({
            where: { id },
            include: subscriptionInclude,
        });
        res.json({ payment, subscription: updated });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
