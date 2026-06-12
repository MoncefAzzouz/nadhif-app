"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middlewares/auth");
const firebaseAdmin_1 = require("../lib/firebaseAdmin");
const router = (0, express_1.Router)();
// Broadcast a push notification (ADMIN only).
// Body: { title, body, audience: 'all' | 'cleaners' | 'phone', phone? }
router.post('/broadcast', auth_1.authenticateToken, async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    const { title, body, audience, phone } = req.body;
    if (!title || !body) {
        res.status(400).json({ error: 'Missing title or body' });
        return;
    }
    try {
        let tokens = [];
        if (audience === 'phone') {
            if (!phone) {
                res.status(400).json({ error: 'Missing phone for specific client' });
                return;
            }
            const user = await prisma_1.default.user.findUnique({ where: { phone } });
            if (!user) {
                res.status(404).json({ error: 'No client found with this phone' });
                return;
            }
            tokens = await prisma_1.default.deviceToken.findMany({
                where: { userId: user.id },
                select: { token: true },
            });
        }
        else if (audience === 'cleaners') {
            tokens = await prisma_1.default.deviceToken.findMany({
                where: { user: { role: 'CLEANER' } },
                select: { token: true },
            });
        }
        else {
            // 'all' (default): every registered device
            tokens = await prisma_1.default.deviceToken.findMany({ select: { token: true } });
        }
        const result = await (0, firebaseAdmin_1.sendPushToTokens)(tokens.map((t) => t.token), { title, body, data: { type: 'broadcast' } });
        res.json({
            recipients: tokens.length,
            success: result.success,
            failure: result.failure,
        });
    }
    catch (e) {
        console.error('broadcast failed:', e);
        res.status(500).json({ error: 'Server error' });
    }
});
// Register (or refresh) the current device's FCM token for the logged-in user.
router.post('/token', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    const { token, platform } = req.body;
    if (!userId) {
        res.status(401).json({ error: 'User unauthorized' });
        return;
    }
    if (!token || !platform) {
        res.status(400).json({ error: 'Missing token or platform' });
        return;
    }
    try {
        // A token is unique to a device; upsert so re-logins / refreshes just
        // re-point the existing token at the current user.
        const saved = await prisma_1.default.deviceToken.upsert({
            where: { token },
            update: { userId, platform },
            create: { userId, token, platform },
        });
        res.json({ id: saved.id });
    }
    catch (e) {
        console.error('register device token failed:', e);
        res.status(500).json({ error: 'Server error' });
    }
});
// Remove a device token (e.g. on logout).
router.delete('/token', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    const { token } = req.body;
    if (!userId) {
        res.status(401).json({ error: 'User unauthorized' });
        return;
    }
    if (!token) {
        res.status(400).json({ error: 'Missing token' });
        return;
    }
    try {
        await prisma_1.default.deviceToken.deleteMany({ where: { token, userId } });
        res.json({ success: true });
    }
    catch (e) {
        console.error('delete device token failed:', e);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
