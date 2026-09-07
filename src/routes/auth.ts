import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  authenticateToken,
  requireAccount,
  isGuest,
  GUEST_ROLE,
  GUEST_USER_ID,
  AuthenticatedRequest,
} from '../middlewares/auth';
import { sendEmail } from '../lib/email';

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

// In-memory reset code store (code expires after 10 minutes)
const resetCodes = new Map<string, { code: string; expiresAt: number }>();

// Forgot password — sends a 6-digit code to the user's email
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists
      res.json({ success: true, message: 'If this email is registered, a reset code has been sent.' });
      return;
    }
    const code = crypto.randomInt(100000, 999999).toString();
    resetCodes.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

    await sendEmail({
      to: email,
      subject: 'Nadhif — Password Reset Code',
      html: `<p>Your password reset code is: <strong>${code}</strong></p><p>This code expires in 10 minutes.</p>`,
    });

    res.json({ success: true, message: 'If this email is registered, a reset code has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password — verifies code and sets new password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const stored = resetCodes.get(email);
  if (!stored || stored.code !== code || Date.now() > stored.expiresAt) {
    res.status(400).json({ error: 'Invalid or expired reset code' });
    return;
  }
  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    resetCodes.delete(email);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Guest session ───────────────────────────────────────────────────────────
// Lets the app open without signing up: the token it returns unlocks the
// browse-only endpoints (catalogue, point store, availability) and is refused by
// every route that would create or change something. Nothing is written to the
// database, so a guest leaves no trace and no account to clean up.
router.post('/guest', async (_req: Request, res: Response) => {
  const token = jwt.sign(
    { userId: GUEST_USER_ID, role: GUEST_ROLE },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' },
  );

  res.json({
    token,
    user: {
      id: GUEST_USER_ID,
      email: '',
      phone: '',
      fullName: 'Guest',
      role: GUEST_ROLE,
      isGuest: true,
    },
  });
});

// Current authenticated user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  // A guest has no row to read; hand back the same shape so the app can render
  // its profile screen and decide to show the "sign up" call to action.
  if (isGuest(req)) {
    res.json({
      id: GUEST_USER_ID,
      email: '',
      phone: '',
      fullName: 'Guest',
      role: GUEST_ROLE,
      isGuest: true,
    });
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

// Update own profile (mobile client)
router.put('/me', authenticateToken, requireAccount, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }

  const { fullName, email, phone } = req.body as {
    fullName?: string;
    email?: string;
    phone?: string;
  };

  if (fullName !== undefined && !fullName.trim()) {
    res.status(400).json({ error: 'Full name cannot be empty' });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName !== undefined && { fullName: fullName.trim() }),
        ...(email !== undefined && email.trim() && { email: email.trim() }),
        ...(phone !== undefined && phone.trim() && { phone: phone.trim() }),
      },
    });
    res.json(serializeUser(user));
  } catch (err: any) {
    if (err?.code === 'P2002') {
      res.status(409).json({ error: 'Email or phone already in use by another account' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete self account (mobile client)
router.delete('/delete-account', authenticateToken, requireAccount, async (req: AuthenticatedRequest, res: Response) => {
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
