"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// ─── GUARD: All admin routes require ADMIN role ─────────────────────────────
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
}
// Apply auth + role check to all routes
router.use(auth_1.authenticateToken);
router.use(requireAdmin);
// ─── USERS ───────────────────────────────────────────────────────────────────
// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.$transaction([
            prisma_1.default.deviceToken.deleteMany({ where: { userId: id } }),
            prisma_1.default.order.deleteMany({ where: { userId: id } }),
            prisma_1.default.subscriptionSession.deleteMany({ where: { subscription: { userId: id } } }),
            prisma_1.default.subscriptionPayment.deleteMany({ where: { subscription: { userId: id } } }),
            prisma_1.default.subscription.deleteMany({ where: { userId: id } }),
            prisma_1.default.user.delete({ where: { id } }),
        ]);
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/users (Create User)
router.post('/users', async (req, res) => {
    const { email, phone, fullName, role, password } = req.body;
    if (!email || !phone || !fullName || !role || !password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    try {
        const existing = await prisma_1.default.user.findFirst({
            where: { OR: [{ email }, { phone }] }
        });
        if (existing) {
            res.status(409).json({ error: 'User with this email or phone already exists' });
            return;
        }
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                phone,
                fullName,
                role,
                passwordHash
            },
            select: {
                id: true,
                email: true,
                phone: true,
                fullName: true,
                role: true,
                createdAt: true
            }
        });
        res.status(201).json(user);
    }
    catch (err) {
        console.error('Create user failed:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT /api/admin/users/:id (Edit User)
router.put('/users/:id', async (req, res) => {
    const id = req.params.id;
    const { email, phone, fullName, role, password } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (email && email !== user.email) {
            const emailExists = await prisma_1.default.user.findUnique({ where: { email } });
            if (emailExists) {
                res.status(409).json({ error: 'Email already in use' });
                return;
            }
        }
        if (phone && phone !== user.phone) {
            const phoneExists = await prisma_1.default.user.findUnique({ where: { phone } });
            if (phoneExists) {
                res.status(409).json({ error: 'Phone already in use' });
                return;
            }
        }
        const data = {
            email,
            phone,
            fullName,
            role
        };
        if (password) {
            const bcrypt = require('bcryptjs');
            data.passwordHash = await bcrypt.hash(password, 10);
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                phone: true,
                fullName: true,
                role: true,
                createdAt: true
            }
        });
        res.json(updatedUser);
    }
    catch (err) {
        console.error('Update user failed:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── CLEANERS ────────────────────────────────────────────────────────────────
// GET /api/admin/cleaners
router.get('/cleaners', async (req, res) => {
    try {
        const cleaners = await prisma_1.default.cleaner.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(cleaners);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/cleaners
router.post('/cleaners', async (req, res) => {
    const { fullName, phone, bio, isActive, skills } = req.body;
    if (!fullName || !phone) {
        res.status(400).json({ error: 'fullName and phone are required' });
        return;
    }
    try {
        const cleaner = await prisma_1.default.cleaner.create({
            data: { fullName, phone, bio, isActive: isActive ?? true, skills: skills || [] },
        });
        res.status(201).json(cleaner);
    }
    catch (err) {
        console.error(err);
        if (err.code === 'P2002') {
            res.status(409).json({ error: 'Ce numéro de téléphone est déjà enregistré pour un autre cleaner.' });
            return;
        }
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT /api/admin/cleaners/:id
router.put('/cleaners/:id', async (req, res) => {
    const id = req.params.id;
    const { fullName, phone, bio, isActive, rating, skills } = req.body;
    try {
        const cleaner = await prisma_1.default.cleaner.update({
            where: { id },
            data: { fullName, phone, bio, isActive, rating, skills },
        });
        res.json(cleaner);
    }
    catch (err) {
        console.error(err);
        if (err.code === 'P2002') {
            res.status(409).json({ error: 'Ce numéro de téléphone est déjà enregistré pour un autre cleaner.' });
            return;
        }
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/admin/cleaners/:id
router.delete('/cleaners/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.cleaner.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── PROMOS ──────────────────────────────────────────────────────────────────
// GET /api/admin/promos
router.get('/promos', async (req, res) => {
    try {
        const promos = await prisma_1.default.promo.findMany({
            orderBy: { validFrom: 'desc' },
        });
        res.json(promos);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/promos
router.post('/promos', async (req, res) => {
    const { code, discountPercent, validFrom, validUntil, isActive } = req.body;
    if (!code || discountPercent == null || !validFrom || !validUntil) {
        res.status(400).json({ error: 'code, discountPercent, validFrom, validUntil are required' });
        return;
    }
    try {
        const promo = await prisma_1.default.promo.create({
            data: {
                code,
                discountPercent: parseFloat(discountPercent),
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                isActive: isActive ?? true,
            },
        });
        res.status(201).json(promo);
    }
    catch (err) {
        if (err.code === 'P2002') {
            res.status(409).json({ error: 'Promo code already exists' });
            return;
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT /api/admin/promos/:id
router.put('/promos/:id', async (req, res) => {
    const id = req.params.id;
    const { code, discountPercent, validFrom, validUntil, isActive } = req.body;
    try {
        const promo = await prisma_1.default.promo.update({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/admin/promos/:id
router.delete('/promos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.promo.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── SERVICES (Admin CRUD) ────────────────────────────────────────────────────
// POST /api/admin/services
router.post('/services', async (req, res) => {
    const { name, nameAr, nameFr, description, descriptionAr, descriptionFr, picture, extraWorkerPrice, rapidExtraWorkerPrice, durationHours, materialPrice, materialsMandatory, localProductPrice, importedProductPrice, productsMandatory, isActive, houseConfigs, details, } = req.body;
    if (!name || !description) {
        res.status(400).json({ error: 'name and description are required' });
        return;
    }
    try {
        const service = await prisma_1.default.service.create({
            data: {
                name,
                nameAr: nameAr || '',
                nameFr: nameFr || '',
                description,
                descriptionAr: descriptionAr || '',
                descriptionFr: descriptionFr || '',
                picture: picture || '',
                details: details !== undefined ? details : undefined,
                extraWorkerPrice: parseFloat(extraWorkerPrice ?? 0),
                rapidExtraWorkerPrice: parseFloat(rapidExtraWorkerPrice ?? 0),
                durationHours: parseInt(durationHours ?? 4),
                materialPrice: parseFloat(materialPrice ?? 0),
                materialsMandatory: materialsMandatory ?? false,
                localProductPrice: parseFloat(localProductPrice ?? 0),
                importedProductPrice: parseFloat(importedProductPrice ?? 0),
                productsMandatory: productsMandatory ?? false,
                isActive: isActive ?? true,
                houseConfigs: houseConfigs
                    ? {
                        create: houseConfigs.map((hc) => ({
                            type: hc.type,
                            typeAr: hc.typeAr || '',
                            typeFr: hc.typeFr || '',
                            workers: parseInt(hc.workers),
                            basePrice: parseFloat(hc.basePrice),
                            rapidBasePrice: parseFloat(hc.rapidBasePrice ?? 0),
                            durationHours: parseInt(hc.durationHours ?? 3),
                        })),
                    }
                    : undefined,
            },
            include: { houseConfigs: true },
        });
        res.status(201).json(service);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT /api/admin/services/:id
router.put('/services/:id', async (req, res) => {
    const id = req.params.id;
    const { name, nameAr, nameFr, description, descriptionAr, descriptionFr, picture, extraWorkerPrice, rapidExtraWorkerPrice, durationHours, materialPrice, materialsMandatory, localProductPrice, importedProductPrice, productsMandatory, isActive, houseConfigs, details, } = req.body;
    try {
        const service = await prisma_1.default.service.update({
            where: { id },
            data: {
                name,
                nameAr: nameAr !== undefined ? nameAr : undefined,
                nameFr: nameFr !== undefined ? nameFr : undefined,
                description,
                descriptionAr: descriptionAr !== undefined ? descriptionAr : undefined,
                descriptionFr: descriptionFr !== undefined ? descriptionFr : undefined,
                picture,
                details: details !== undefined ? details : undefined,
                extraWorkerPrice: extraWorkerPrice != null ? parseFloat(extraWorkerPrice) : undefined,
                rapidExtraWorkerPrice: rapidExtraWorkerPrice != null ? parseFloat(rapidExtraWorkerPrice) : undefined,
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
            const existingIds = houseConfigs.filter((hc) => hc.id).map((hc) => hc.id);
            try {
                await prisma_1.default.houseConfig.deleteMany({
                    where: { serviceId: id, id: { notIn: existingIds } }
                });
            }
            catch (e) {
                // ignore if referenced by an existing order
            }
            for (const hc of houseConfigs) {
                if (hc.id) {
                    await prisma_1.default.houseConfig.update({
                        where: { id: hc.id },
                        data: {
                            type: hc.type,
                            typeAr: hc.typeAr !== undefined ? hc.typeAr : undefined,
                            typeFr: hc.typeFr !== undefined ? hc.typeFr : undefined,
                            workers: parseInt(hc.workers),
                            basePrice: parseFloat(hc.basePrice),
                            rapidBasePrice: parseFloat(hc.rapidBasePrice ?? 0),
                            durationHours: parseInt(hc.durationHours ?? 3),
                        }
                    });
                }
                else {
                    await prisma_1.default.houseConfig.create({
                        data: {
                            serviceId: id,
                            type: hc.type,
                            typeAr: hc.typeAr || '',
                            typeFr: hc.typeFr || '',
                            workers: parseInt(hc.workers),
                            basePrice: parseFloat(hc.basePrice),
                            rapidBasePrice: parseFloat(hc.rapidBasePrice ?? 0),
                            durationHours: parseInt(hc.durationHours ?? 3),
                        }
                    });
                }
            }
        }
        const updatedService = await prisma_1.default.service.findUnique({
            where: { id },
            include: { houseConfigs: true },
        });
        res.json(updatedService);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/admin/services/:id
router.delete('/services/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.service.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/orders (Manual Order Creation)
router.post('/orders', async (req, res) => {
    const { fullName, phone, address, latitude, longitude, serviceId, houseConfigId, categoryId, categoryServiceId, scheduledDate, extraWorkers, useMaterials, productOrigin, promoCode, sizeM2, clientNote, housePictures, isRapid } = req.body;
    if (!phone || !address || (!serviceId && !categoryId) || (!houseConfigId && !categoryServiceId) || !scheduledDate) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    try {
        // 1. Find or create guest user
        let user = await prisma_1.default.user.findUnique({ where: { phone } });
        if (!user) {
            const bcrypt = require('bcryptjs');
            const passwordHash = await bcrypt.hash('guest123', 10);
            user = await prisma_1.default.user.create({
                data: {
                    phone,
                    email: `guest_${phone}_${Date.now()}@nadif.com`,
                    fullName: fullName || 'Guest Customer',
                    passwordHash,
                    role: 'CUSTOMER'
                }
            });
        }
        let calculatedTotal = 0;
        let basePrice = 0;
        const workersCount = extraWorkers ? parseInt(extraWorkers.toString()) : 0;
        let extraWorkersPrice = 0;
        let materialsFlag = false;
        let materialsPrice = 0;
        let productsPrice = 0;
        const origin = productOrigin || 'NONE';
        if (serviceId && houseConfigId) {
            // 2. Fetch service and house config
            const service = await prisma_1.default.service.findUnique({
                where: { id: serviceId },
                include: { houseConfigs: true }
            });
            if (!service) {
                res.status(404).json({ error: 'Service not found' });
                return;
            }
            const houseConfig = service.houseConfigs.find((hc) => hc.id === houseConfigId);
            if (!houseConfig) {
                res.status(404).json({ error: 'House config not found' });
                return;
            }
            // 3. Pricing Calculation
            basePrice = (isRapid === true || isRapid === 'true') ? houseConfig.rapidBasePrice : houseConfig.basePrice;
            const extraPriceUnit = (isRapid === true || isRapid === 'true') ? (service.rapidExtraWorkerPrice ?? 0) : service.extraWorkerPrice;
            extraWorkersPrice = workersCount * extraPriceUnit;
            materialsFlag = useMaterials === true || service.materialsMandatory;
            materialsPrice = materialsFlag ? service.materialPrice : 0;
            if (origin === 'LOCAL')
                productsPrice = service.localProductPrice;
            else if (origin === 'IMPORTED')
                productsPrice = service.importedProductPrice;
            calculatedTotal = basePrice + extraWorkersPrice + materialsPrice + productsPrice;
        }
        else if (categoryId && categoryServiceId) {
            // 2. Fetch category and category service
            const category = await prisma_1.default.category.findUnique({
                where: { id: categoryId },
                include: { categoryServices: true }
            });
            if (!category) {
                res.status(404).json({ error: 'Category not found' });
                return;
            }
            const categoryService = category.categoryServices.find((cs) => cs.id === categoryServiceId);
            if (!categoryService) {
                res.status(404).json({ error: 'Category service config not found' });
                return;
            }
            // 3. Pricing Calculation
            basePrice = (isRapid === true || isRapid === 'true') ? categoryService.rapidBasePrice : categoryService.basePrice;
            materialsFlag = useMaterials === true || category.materialsMandatory;
            materialsPrice = materialsFlag ? category.materialPrice : 0;
            if (origin === 'LOCAL')
                productsPrice = category.localProductPrice;
            else if (origin === 'IMPORTED')
                productsPrice = category.importedProductPrice;
            calculatedTotal = basePrice + materialsPrice + productsPrice;
        }
        let finalPromoId = undefined;
        // 4. Promo
        if (promoCode) {
            const promo = await prisma_1.default.promo.findUnique({ where: { code: promoCode } });
            if (promo && promo.isActive) {
                const now = new Date();
                if (now >= promo.validFrom && now <= promo.validUntil) {
                    calculatedTotal = calculatedTotal * (1 - promo.discountPercent / 100);
                    finalPromoId = promo.id;
                }
            }
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
        // 5. Create Order
        const order = await prisma_1.default.order.create({
            data: {
                userId: user.id,
                serviceId: serviceId || null,
                houseConfigId: houseConfigId || null,
                categoryId: categoryId || null,
                categoryServiceId: categoryServiceId || null,
                status: 'PENDING',
                totalPrice: calculatedTotal,
                scheduledDate: new Date(scheduledDate),
                extraWorkers: workersCount,
                useMaterials: materialsFlag,
                productOrigin: origin,
                isRapid: isRapid === true || isRapid === 'true',
                latitude: latitude ? parseFloat(latitude.toString()) : null,
                longitude: longitude ? parseFloat(longitude.toString()) : null,
                address,
                promoId: finalPromoId || null,
                sizeM2: sizeM2 ? parseFloat(sizeM2.toString()) : null,
                clientNote: clientNote || null,
                housePictures: Array.isArray(housePictures) ? housePictures : []
            },
            include: {
                user: { select: { id: true, fullName: true, phone: true } },
                service: { select: { id: true, name: true, picture: true } },
                houseConfig: true,
                category: { select: { id: true, name: true, picture: true } },
                categoryService: true,
                cleaner: true,
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
// ─── CATEGORIES ──────────────────────────────────────────────────────────────
// GET /api/admin/categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany({
            include: { categoryServices: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(categories);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/categories
router.post('/categories', async (req, res) => {
    const { name, nameAr, nameFr, description, descriptionAr, descriptionFr, picture, materialPrice, materialsMandatory, localProductPrice, importedProductPrice, productsMandatory, isActive, categoryServices, details, } = req.body;
    if (!name || !description) {
        res.status(400).json({ error: 'name and description are required' });
        return;
    }
    try {
        const category = await prisma_1.default.category.create({
            data: {
                name,
                nameAr: nameAr || '',
                nameFr: nameFr || '',
                description,
                descriptionAr: descriptionAr || '',
                descriptionFr: descriptionFr || '',
                picture: picture || '',
                details: details !== undefined ? details : undefined,
                materialPrice: parseFloat(materialPrice ?? 0),
                materialsMandatory: materialsMandatory ?? false,
                localProductPrice: parseFloat(localProductPrice ?? 0),
                importedProductPrice: parseFloat(importedProductPrice ?? 0),
                productsMandatory: productsMandatory ?? false,
                isActive: isActive ?? true,
                categoryServices: categoryServices
                    ? {
                        create: categoryServices.map((cs) => ({
                            name: cs.name,
                            nameAr: cs.nameAr || '',
                            nameFr: cs.nameFr || '',
                            workers: parseInt(cs.workers),
                            basePrice: parseFloat(cs.basePrice),
                            rapidBasePrice: parseFloat(cs.rapidBasePrice ?? 0),
                            durationHours: parseInt(cs.durationHours ?? 3),
                        })),
                    }
                    : undefined,
            },
            include: { categoryServices: true },
        });
        res.status(201).json(category);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res) => {
    const id = req.params.id;
    const { name, nameAr, nameFr, description, descriptionAr, descriptionFr, picture, materialPrice, materialsMandatory, localProductPrice, importedProductPrice, productsMandatory, isActive, categoryServices, details, } = req.body;
    try {
        // Delete existing sub-services then recreate
        await prisma_1.default.categoryService.deleteMany({ where: { categoryId: id } });
        const category = await prisma_1.default.category.update({
            where: { id },
            data: {
                name,
                nameAr: nameAr !== undefined ? nameAr : undefined,
                nameFr: nameFr !== undefined ? nameFr : undefined,
                description,
                descriptionAr: descriptionAr !== undefined ? descriptionAr : undefined,
                descriptionFr: descriptionFr !== undefined ? descriptionFr : undefined,
                picture: picture || '',
                details: details !== undefined ? details : undefined,
                materialPrice: parseFloat(materialPrice ?? 0),
                materialsMandatory: materialsMandatory ?? false,
                localProductPrice: parseFloat(localProductPrice ?? 0),
                importedProductPrice: parseFloat(importedProductPrice ?? 0),
                productsMandatory: productsMandatory ?? false,
                isActive: isActive ?? true,
                categoryServices: categoryServices
                    ? {
                        create: categoryServices.map((cs) => ({
                            name: cs.name,
                            nameAr: cs.nameAr || '',
                            nameFr: cs.nameFr || '',
                            workers: parseInt(cs.workers),
                            basePrice: parseFloat(cs.basePrice),
                            rapidBasePrice: parseFloat(cs.rapidBasePrice ?? 0),
                            durationHours: parseInt(cs.durationHours ?? 3),
                        })),
                    }
                    : undefined,
            },
            include: { categoryServices: true },
        });
        res.json(category);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.category.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── PAGES / CMS ─────────────────────────────────────────────────────────────
// GET /api/admin/pages/faqs
router.get('/pages/faqs', async (req, res) => {
    try {
        const faqs = await prisma_1.default.faq.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(faqs);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/pages/faqs
router.post('/pages/faqs', async (req, res) => {
    const { question, answer, order } = req.body;
    if (!question || !answer) {
        res.status(400).json({ error: 'question and answer are required' });
        return;
    }
    try {
        const faq = await prisma_1.default.faq.create({
            data: {
                question,
                answer,
                order: parseInt(order ?? 0)
            }
        });
        res.status(201).json(faq);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// PUT /api/admin/pages/faqs/:id
router.put('/pages/faqs/:id', async (req, res) => {
    const id = req.params.id;
    const { question, answer, order } = req.body;
    try {
        const faq = await prisma_1.default.faq.update({
            where: { id },
            data: {
                question,
                answer,
                order: order !== undefined ? parseInt(order) : undefined
            }
        });
        res.json(faq);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/admin/pages/faqs/:id
router.delete('/pages/faqs/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.faq.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/pages/privacy
router.post('/pages/privacy', async (req, res) => {
    const { privacyPolicy } = req.body;
    if (privacyPolicy === undefined) {
        res.status(400).json({ error: 'privacyPolicy text is required' });
        return;
    }
    try {
        const setting = await prisma_1.default.appSetting.upsert({
            where: { key: 'privacy_policy' },
            update: { value: privacyPolicy },
            create: { key: 'privacy_policy', value: privacyPolicy }
        });
        res.json({ privacyPolicy: setting.value });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/pages/about
router.post('/pages/about', async (req, res) => {
    const aboutData = req.body;
    try {
        const setting = await prisma_1.default.appSetting.upsert({
            where: { key: 'about_us' },
            update: { value: JSON.stringify(aboutData) },
            create: { key: 'about_us', value: JSON.stringify(aboutData) }
        });
        res.json(JSON.parse(setting.value));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/pages/subscription-details
router.post('/pages/subscription-details', async (req, res) => {
    const detailsData = req.body;
    try {
        const setting = await prisma_1.default.appSetting.upsert({
            where: { key: 'subscription_details' },
            update: { value: JSON.stringify(detailsData) },
            create: { key: 'subscription_details', value: JSON.stringify(detailsData) }
        });
        res.json(JSON.parse(setting.value));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/admin/locked-days
router.get('/locked-days', async (req, res) => {
    try {
        const setting = await prisma_1.default.appSetting.findUnique({ where: { key: 'locked_days' } });
        const days = setting ? JSON.parse(setting.value) : [];
        res.json(days);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/locked-days
router.post('/locked-days', async (req, res) => {
    const { lockedDays } = req.body;
    if (!Array.isArray(lockedDays)) {
        res.status(400).json({ error: 'lockedDays must be an array of date strings' });
        return;
    }
    try {
        const setting = await prisma_1.default.appSetting.upsert({
            where: { key: 'locked_days' },
            update: { value: JSON.stringify(lockedDays) },
            create: { key: 'locked_days', value: JSON.stringify(lockedDays) }
        });
        res.json(JSON.parse(setting.value));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/admin/skills
router.get('/skills', async (req, res) => {
    try {
        const skills = await prisma_1.default.skill.findMany({
            include: { services: true, categories: true, subscriptionServiceTiers: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(skills);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/admin/skills
router.post('/skills', async (req, res) => {
    const { name, nameAr, nameFr, description, color, serviceIds, categoryIds, serviceTierIds } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Skill name is required' });
        return;
    }
    try {
        const skill = await prisma_1.default.skill.create({
            data: {
                name,
                nameAr: nameAr || '',
                nameFr: nameFr || '',
                description: description || '',
                color: color || 'slate',
                services: serviceIds && serviceIds.length > 0 ? {
                    connect: serviceIds.map((id) => ({ id }))
                } : undefined,
                categories: categoryIds && categoryIds.length > 0 ? {
                    connect: categoryIds.map((id) => ({ id }))
                } : undefined,
                subscriptionServiceTiers: serviceTierIds && serviceTierIds.length > 0 ? {
                    connect: serviceTierIds.map((id) => ({ id }))
                } : undefined
            },
            include: { services: true, categories: true, subscriptionServiceTiers: true }
        });
        res.status(201).json(skill);
    }
    catch (err) {
        console.error(err);
        if (err.code === 'P2002') {
            res.status(400).json({ error: 'A skill with this name already exists' });
        }
        else {
            res.status(500).json({ error: 'Server error' });
        }
    }
});
// PUT /api/admin/skills/:id
router.put('/skills/:id', async (req, res) => {
    const id = req.params.id;
    const { name, nameAr, nameFr, description, color, serviceIds, categoryIds, serviceTierIds } = req.body;
    try {
        const skill = await prisma_1.default.skill.update({
            where: { id },
            data: {
                name,
                nameAr: nameAr !== undefined ? nameAr : undefined,
                nameFr: nameFr !== undefined ? nameFr : undefined,
                description: description !== undefined ? description : undefined,
                color: color !== undefined ? color : undefined,
                services: serviceIds !== undefined ? {
                    set: (serviceIds || []).map((id) => ({ id }))
                } : undefined,
                categories: categoryIds !== undefined ? {
                    set: (categoryIds || []).map((id) => ({ id }))
                } : undefined,
                subscriptionServiceTiers: serviceTierIds !== undefined ? {
                    set: (serviceTierIds || []).map((id) => ({ id }))
                } : undefined
            },
            include: { services: true, categories: true, subscriptionServiceTiers: true }
        });
        res.json(skill);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/admin/skills/:id
router.delete('/skills/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.skill.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
// Trigger reload for Prisma client regeneration updates.
