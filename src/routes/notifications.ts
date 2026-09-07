import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, requireAccount, AuthenticatedRequest } from '../middlewares/auth';
import { sendPushToTokens } from '../lib/firebaseAdmin';

const router = Router();

// Broadcast a push notification (ADMIN only).
// Body: { title, body, audience: 'all' | 'cleaners' | 'phone', phone? }
router.post('/broadcast', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  const { title, body, audience, phone } = req.body as {
    title?: string;
    body?: string;
    audience?: 'all' | 'cleaners' | 'phone';
    phone?: string;
  };

  if (!title || !body) {
    res.status(400).json({ error: 'Missing title or body' });
    return;
  }

  try {
    let tokens: { token: string }[] = [];

    if (audience === 'phone') {
      if (!phone) {
        res.status(400).json({ error: 'Missing phone for specific client' });
        return;
      }
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        res.status(404).json({ error: 'No client found with this phone' });
        return;
      }
      tokens = await prisma.deviceToken.findMany({
        where: { userId: user.id },
        select: { token: true },
      });
    } else if (audience === 'cleaners') {
      tokens = await prisma.deviceToken.findMany({
        where: { user: { role: 'CLEANER' } },
        select: { token: true },
      });
    } else {
      // 'all' (default): every registered device
      tokens = await prisma.deviceToken.findMany({ select: { token: true } });
    }

    const result = await sendPushToTokens(
      tokens.map((t) => t.token),
      { title, body, data: { type: 'broadcast' } },
    );

    res.json({
      recipients: tokens.length,
      success: result.success,
      failure: result.failure,
    });
  } catch (e) {
    console.error('broadcast failed:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register (or refresh) the current device's FCM token for the logged-in user.
router.post('/token', authenticateToken, requireAccount, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { token, platform } = req.body as { token?: string; platform?: string };

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
    const saved = await prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    });
    res.json({ id: saved.id });
  } catch (e) {
    console.error('register device token failed:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove a device token (e.g. on logout).
router.delete('/token', authenticateToken, requireAccount, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { token } = req.body as { token?: string };

  if (!userId) {
    res.status(401).json({ error: 'User unauthorized' });
    return;
  }
  if (!token) {
    res.status(400).json({ error: 'Missing token' });
    return;
  }

  try {
    await prisma.deviceToken.deleteMany({ where: { token, userId } });
    res.json({ success: true });
  } catch (e) {
    console.error('delete device token failed:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
