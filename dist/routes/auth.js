"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
function signUserToken(userId, role) {
    return jsonwebtoken_1.default.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
function serializeUser(user) {
    return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
    };
}
// Register new user
router.post('/register', async (req, res) => {
    const { email, phone, password, fullName } = req.body;
    if (!email || !phone || !password || !fullName) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    try {
        const existing = await prisma_1.default.user.findFirst({ where: { OR: [{ email }, { phone }] } });
        if (existing) {
            res.status(409).json({ error: 'User with email or phone already exists' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: { email, phone, passwordHash, fullName, role: 'CUSTOMER' },
        });
        res.status(201).json(serializeUser(user));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Missing email or password' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = signUserToken(user.id, user.role);
        res.json({ token, user: serializeUser(user) });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Send OTP Code
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    console.log(`Sending OTP code 1234 to phone: ${phone}`);
    res.json({ success: true, message: 'OTP code sent' });
});
// Verify OTP Code
router.post('/verify-otp', async (req, res) => {
    const { phone, code } = req.body;
    if (code !== '1234') {
        res.status(400).json({ error: 'Invalid verification code' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { phone } });
        if (user) {
            const token = signUserToken(user.id, user.role);
            res.json({ success: true, token, user: serializeUser(user) });
        }
        else {
            res.json({ success: true, isNewUser: true });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Register user via Phone
router.post('/register-phone', async (req, res) => {
    const { fullName, phone } = req.body;
    if (!fullName || !phone) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    try {
        const existing = await prisma_1.default.user.findUnique({ where: { phone } });
        if (existing) {
            const token = signUserToken(existing.id, existing.role);
            res.json({ token, user: serializeUser(existing) });
            return;
        }
        const dummyEmail = `${phone}@nadhif.com`;
        const passwordHash = await bcryptjs_1.default.hash('dummy_otp_password', 10);
        const user = await prisma_1.default.user.create({
            data: {
                email: dummyEmail,
                phone,
                passwordHash,
                fullName,
                role: 'CUSTOMER',
            },
        });
        const token = signUserToken(user.id, user.role);
        res.json({ token, user: serializeUser(user) });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Current authenticated user
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'User unauthorized' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(serializeUser(user));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Update own profile (mobile client)
router.put('/me', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'User unauthorized' });
        return;
    }
    const { fullName, email, phone } = req.body;
    if (fullName !== undefined && !fullName.trim()) {
        res.status(400).json({ error: 'Full name cannot be empty' });
        return;
    }
    try {
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                ...(fullName !== undefined && { fullName: fullName.trim() }),
                ...(email !== undefined && email.trim() && { email: email.trim() }),
                ...(phone !== undefined && phone.trim() && { phone: phone.trim() }),
            },
        });
        res.json(serializeUser(user));
    }
    catch (err) {
        if (err?.code === 'P2002') {
            res.status(409).json({ error: 'Email or phone already in use by another account' });
            return;
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Delete self account (mobile client)
router.delete('/delete-account', auth_1.authenticateToken, async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'User unauthorized' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        await prisma_1.default.$transaction([
            prisma_1.default.deviceToken.deleteMany({ where: { userId } }),
            prisma_1.default.order.deleteMany({ where: { userId } }),
            prisma_1.default.subscriptionSession.deleteMany({ where: { subscription: { userId } } }),
            prisma_1.default.subscriptionPayment.deleteMany({ where: { subscription: { userId } } }),
            prisma_1.default.subscription.deleteMany({ where: { userId } }),
            prisma_1.default.user.delete({ where: { id: userId } }),
        ]);
        res.json({ success: true, message: 'Account deleted successfully' });
    }
    catch (err) {
        console.error('Account self-deletion failed:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
