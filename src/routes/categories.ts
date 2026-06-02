import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all active categories with their sub-services
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { categoryServices: true }
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single category by ID
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { categoryServices: true }
    });
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
