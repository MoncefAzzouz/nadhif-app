import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// Get all active services with their house configs
router.get('/', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { houseConfigs: true }
    });
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single service by ID
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: { houseConfigs: true }
    });
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
