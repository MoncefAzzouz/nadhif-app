"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Restart trigger: pick up updated Prisma Client enums
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const services_1 = __importDefault(require("./routes/services"));
const categories_1 = __importDefault(require("./routes/categories"));
const pages_1 = __importDefault(require("./routes/pages"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
const prisma_1 = __importDefault(require("./lib/prisma"));
dotenv_1.default.config();
// Ensure Order_cleanerId_fkey is dropped to support multi-cleaner comma-separated assignment
prisma_1.default.$executeRawUnsafe('ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_cleanerId_fkey";')
    .then(() => console.log('Database constraints initialized (multi-cleaner support enabled).'))
    .catch(err => console.error('Error dropping Order_cleanerId_fkey constraint:', err));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Basic health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Nadhif Backend API is running!' });
});
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/services', services_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/pages', pages_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/admin', admin_1.default);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
