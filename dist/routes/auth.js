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
exports.default = router;
