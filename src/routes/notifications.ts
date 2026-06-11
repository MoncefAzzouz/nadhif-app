import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Register (or refresh) the current device's FCM token for the logged-in user.
router.post('/token', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
router.delete('/token', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
