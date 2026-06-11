import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Validate a promo code for the mobile app (any authenticated user).
// Returns the discount so the client can preview the reduced total; the
// authoritative discount is still applied server-side at order creation.
router.get('/:code', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const code = req.params.code as string;

  try {
    const promo = await prisma.promo.findUnique({ where: { code } });
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
  } catch (e) {
    console.error('promo validation failed:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
