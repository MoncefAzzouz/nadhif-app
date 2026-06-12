"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
function isPublicSlideImage(imageUrl) {
    return imageUrl.trim() !== '' && !imageUrl.startsWith('data:image');
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
}
// ─── Public: active slides for the mobile carousel ──────────────────────────
router.get('/', async (req, res) => {
    try {
        const slides = await prisma_1.default.slide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json(slides.filter((slide) => isPublicSlideImage(slide.imageUrl)));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── Admin: full list (incl. inactive) ──────────────────────────────────────
router.get('/all', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const slides = await prisma_1.default.slide.findMany({ orderBy: { order: 'asc' } });
        res.json(slides);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── Admin: create ──────────────────────────────────────────────────────────
router.post('/', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    const { title, description, imageUrl, actionRoute, order, isActive } = req.body;
    if (!imageUrl) {
        res.status(400).json({ error: 'imageUrl is required' });
        return;
    }
    if (!isPublicSlideImage(imageUrl)) {
        res.status(400).json({ error: 'Please upload an image file instead of base64 data.' });
        return;
    }
    try {
        const slide = await prisma_1.default.slide.create({
            data: {
                title: title || '',
                description: description || '',
                imageUrl,
                actionRoute: actionRoute || '',
                order: typeof order === 'number' ? order : 0,
                isActive: isActive !== false,
            },
        });
        res.status(201).json(slide);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── Admin: update ──────────────────────────────────────────────────────────
router.put('/:id', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    const id = req.params.id;
    const { title, description, imageUrl, actionRoute, order, isActive } = req.body;
    if (imageUrl !== undefined && !isPublicSlideImage(imageUrl)) {
        res.status(400).json({ error: 'Please upload an image file instead of base64 data.' });
        return;
    }
    try {
        const slide = await prisma_1.default.slide.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(actionRoute !== undefined && { actionRoute }),
                ...(order !== undefined && { order }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.json(slide);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// ─── Admin: delete ──────────────────────────────────────────────────────────
router.delete('/:id', auth_1.authenticateToken, requireAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        await prisma_1.default.slide.delete({ where: { id } });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
