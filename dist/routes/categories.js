"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Get all active categories with their sub-services
router.get('/', async (req, res) => {
    try {
        const categories = await prisma_1.default.category.findMany({
            where: { isActive: true },
            include: { categoryServices: true }
        });
        res.json(categories);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get a single category by ID
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const category = await prisma_1.default.category.findUnique({
            where: { id },
            include: { categoryServices: true }
        });
        if (!category) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }
        res.json(category);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
