"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
// Get all active services with their house configs
router.get('/', async (req, res) => {
    try {
        const services = await prisma_1.default.service.findMany({
            where: { isActive: true },
            include: { houseConfigs: true }
        });
        res.json(services);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get a single service by ID
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const service = await prisma_1.default.service.findUnique({
            where: { id },
            include: { houseConfigs: true }
        });
        if (!service) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        res.json(service);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
