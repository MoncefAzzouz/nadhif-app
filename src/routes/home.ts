import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

function isPublicImage(imageUrl: string) {
  return imageUrl.trim() !== '' && !imageUrl.startsWith('data:image');
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const [slides, categories, services] = await Promise.all([
      prisma.slide.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: { categoryServices: true },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        include: { houseConfigs: true },
      }),
    ]);

    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.json({
      slides: slides.filter((slide) => isPublicImage(slide.imageUrl)),
      categories,
      services,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
