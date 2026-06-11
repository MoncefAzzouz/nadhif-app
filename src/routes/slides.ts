import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

function requireAdmin(req: AuthenticatedRequest, res: Response, next: any) {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

// ─── Public: active slides for the mobile carousel ──────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const slides = await prisma.slide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(slides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin: full list (incl. inactive) ──────────────────────────────────────
router.get('/all', authenticateToken as any, requireAdmin as any, async (req: Request, res: Response) => {
  try {
    const slides = await prisma.slide.findMany({ orderBy: { order: 'asc' } });
    res.json(slides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin: create ──────────────────────────────────────────────────────────
router.post('/', authenticateToken as any, requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, imageUrl, actionRoute, order, isActive } = req.body;
  if (!imageUrl) {
    res.status(400).json({ error: 'imageUrl is required' });
    return;
  }
  try {
    const slide = await prisma.slide.create({
      data: {
        title: title || '',
        description: description || '',
        imageUrl,
        actionRoute: actionRoute || '',
        order: typeof order === 'number' ? order : 0,
        isActive: isActive !== false,
      },
    });
    res.status(201).json(slide);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin: update ──────────────────────────────────────────────────────────
router.put('/:id', authenticateToken as any, requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { title, description, imageUrl, actionRoute, order, isActive } = req.body;
  try {
    const slide = await prisma.slide.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(actionRoute !== undefined && { actionRoute }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json(slide);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin: delete ──────────────────────────────────────────────────────────
router.delete('/:id', authenticateToken as any, requireAdmin as any, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  try {
    await prisma.slide.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
