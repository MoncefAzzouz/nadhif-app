// Restart trigger: pick up updated Prisma Client enums, subscriptionServiceTiers, and Slides
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import categoriesRoutes from './routes/categories';
import pagesRoutes from './routes/pages';
import ordersRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import notificationsRoutes from './routes/notifications';
import subscriptionsRoutes from './routes/subscriptions';
import promosRoutes from './routes/promos';
import slidesRoutes from './routes/slides';
import uploadRoutes, { UPLOADS_DIR } from './routes/upload';

import prisma from './lib/prisma';

dotenv.config();

// Ensure Order_cleanerId_fkey is dropped to support multi-cleaner comma-separated assignment
prisma.$executeRawUnsafe('ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_cleanerId_fkey";')
  .then(() => console.log('Database constraints initialized (multi-cleaner support enabled).'))
  .catch(err => console.error('Error dropping Order_cleanerId_fkey constraint:', err));

const app = express();

// Allowed browser origins for the admin website. Configurable via CORS_ORIGINS
// (comma-separated) so deployments can add the VPS/admin URL without code edits.
const corsOrigins = (process.env.CORS_ORIGINS ||
  'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Nadhif Backend API is running!' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/promos', promosRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/upload', uploadRoutes);

// Uploaded images (referenced by Service/Category/Slide/Order records).
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d', immutable: true }));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
