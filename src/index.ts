import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import ordersRoutes from './routes/orders';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Nadhif Backend API is running!' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
