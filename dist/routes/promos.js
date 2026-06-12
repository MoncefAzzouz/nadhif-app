"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Validate a promo code for the mobile app (any authenticated user).
// Returns the discount so the client can preview the reduced total; the
// authoritative discount is still applied server-side at order creation.
router.get('/:code', auth_1.authenticateToken, async (req, res) => {
    const code = req.params.code;
    try {
        const promo = await prisma_1.default.promo.findUnique({ where: { code } });
        if (!promo || !promo.isActive) {
            res.status(404).json({ error: 'Invalid or inactive promo code' });
            return;
        }
        const now = new Date();
        if (now < promo.validFrom || now > promo.validUntil) {
            res.status(404).json({ error: 'Promo code is expired or not yet active' });
            return;
        }
        res.json({ code: promo.code, discountPercent: promo.discountPercent });
    }
    catch (e) {
        console.error('promo validation failed:', e);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
