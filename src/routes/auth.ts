import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

function signUserToken(userId: string, role: string) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
}

function serializeUser(user: {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: string;
}) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
  };
}

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  const { email, phone, password, fullName } = req.body;
  if (!email || !phone || !password || !fullName) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) {
      res.status(409).json({ error: 'User with email or phone already exists' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, phone, passwordHash, fullName, role: 'CUSTOMER' },
    });
    res.status(201).json(serializeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Missing email or password' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signUserToken(user.id, user.role);
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send OTP Code
router.post('/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;
  console.log(`Sending OTP code 1234 to phone: ${phone}`);
  res.json({ success: true, message: 'OTP code sent' });
});

// Verify OTP Code
router.post('/verify-otp', async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (code !== '1234') {
    res.status(400).json({ error: 'Invalid verification code' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      const token = signUserToken(user.id, user.role);
      res.json({ success: true, token, user: serializeUser(user) });
    } else {
      res.json({ success: true, isNewUser: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register user via Phone
router.post('/register-phone', async (req: Request, res: Response) => {
  const { fullName, phone } = req.body;
  if (!fullName || !phone) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  try {
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      const token = signUserToken(existing.id, existing.role);
      res.json({ token, user: serializeUser(existing) });
      return;
    }
    const dummyEmail = `${phone}@nadhif.com`;
    const passwordHash = await bcrypt.hash('dummy_otp_password', 10);
    const user = await prisma.user.create({
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Current authenticated user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(serializeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete self account (mobile client)
router.delete('/delete-account', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.$transaction([
      prisma.deviceToken.deleteMany({ where: { userId } }),
      prisma.order.deleteMany({ where: { userId } }),
      prisma.subscriptionSession.deleteMany({ where: { subscription: { userId } } }),
      prisma.subscriptionPayment.deleteMany({ where: { subscription: { userId } } }),
      prisma.subscription.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account self-deletion failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
