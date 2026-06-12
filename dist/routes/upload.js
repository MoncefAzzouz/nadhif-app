"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOADS_DIR = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Files are written to <repo>/uploads and served statically at /uploads.
exports.UPLOADS_DIR = path_1.default.join(__dirname, '..', '..', 'uploads');
if (!fs_1.default.existsSync(exports.UPLOADS_DIR))
    fs_1.default.mkdirSync(exports.UPLOADS_DIR, { recursive: true });
const ALLOWED_MIME = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per image
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME[file.mimetype])
            cb(null, true);
        else
            cb(new Error('Only JPEG, PNG or WebP images are allowed'));
    },
});
// POST /api/upload — multipart field "file"; returns { url: "/uploads/<name>" }
router.post('/', auth_1.authenticateToken, (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            res.status(400).json({ error: err.message || 'Upload failed' });
            return;
        }
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'Missing file' });
            return;
        }
        const name = `${crypto_1.default.randomUUID()}${ALLOWED_MIME[file.mimetype]}`;
        fs_1.default.writeFile(path_1.default.join(exports.UPLOADS_DIR, name), file.buffer, (writeErr) => {
            if (writeErr) {
                console.error('upload write failed:', writeErr);
                res.status(500).json({ error: 'Server error' });
                return;
            }
            res.status(201).json({ url: `/uploads/${name}` });
        });
    });
});
exports.default = router;
