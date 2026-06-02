// Restart trigger: pick up updated Prisma Client enums
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import categoriesRoutes from './routes/categories';
import pagesRoutes from './routes/pages';
import ordersRoutes from './routes/orders';
import adminRoutes from './routes/admin';

import prisma from './lib/prisma';

dotenv.config();

// Ensure Order_cleanerId_fkey is dropped to support multi-cleaner comma-separated assignment
prisma.$executeRawUnsafe('ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_cleanerId_fkey";')
  .then(() => console.log('Database constraints initialized (multi-cleaner support enabled).'))
  .catch(err => console.error('Error dropping Order_cleanerId_fkey constraint:', err));

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
