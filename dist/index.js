"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Restart trigger: pick up updated Prisma Client enums, subscriptionServiceTiers, and Slides v3
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const services_1 = __importDefault(require("./routes/services"));
const categories_1 = __importDefault(require("./routes/categories"));
const pages_1 = __importDefault(require("./routes/pages"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const subscriptions_1 = __importDefault(require("./routes/subscriptions"));
const promos_1 = __importDefault(require("./routes/promos"));
const slides_1 = __importDefault(require("./routes/slides"));
const home_1 = __importDefault(require("./routes/home"));
const upload_1 = __importStar(require("./routes/upload"));
const prisma_1 = __importDefault(require("./lib/prisma"));
dotenv_1.default.config();
// Ensure Order_cleanerId_fkey is dropped to support multi-cleaner comma-separated assignment
prisma_1.default.$executeRawUnsafe('ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_cleanerId_fkey";')
    .then(() => console.log('Database constraints initialized (multi-cleaner support enabled).'))
    .catch(err => console.error('Error dropping Order_cleanerId_fkey constraint:', err));
const app = (0, express_1.default)();
// Allowed browser origins for the admin website. Configurable via CORS_ORIGINS
// (comma-separated) so deployments can add the VPS/admin URL without code edits.
const corsOrigins = (process.env.CORS_ORIGINS ||
    'http://localhost:3000,http://127.0.0.1:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: corsOrigins,
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
app.use('/api/notifications', notifications_1.default);
app.use('/api/subscriptions', subscriptions_1.default);
app.use('/api/promos', promos_1.default);
app.use('/api/slides', slides_1.default);
app.use('/api/home', home_1.default);
app.use('/api/upload', upload_1.default);
// Uploaded images (referenced by Service/Category/Slide/Order records).
app.use('/uploads', express_1.default.static(upload_1.UPLOADS_DIR, { maxAge: '7d', immutable: true }));
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
