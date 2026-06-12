"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
function isPublicImage(imageUrl) {
    return imageUrl.trim() !== '' && !imageUrl.startsWith('data:image');
}
router.get('/', async (_req, res) => {
    try {
        const [slides, categories, services] = await Promise.all([
            prisma_1.default.slide.findMany({
                where: { isActive: true },
                orderBy: { order: 'asc' },
            }),
            prisma_1.default.category.findMany({
                where: { isActive: true },
                include: { categoryServices: true },
            }),
            prisma_1.default.service.findMany({
                where: { isActive: true },
                include: { houseConfigs: true },
            }),
        ]);
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
        res.json({
            slides: slides.filter((slide) => isPublicImage(slide.imageUrl)),
            categories,
            services,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
