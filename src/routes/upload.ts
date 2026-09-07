import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticateToken, requireAccount, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Files are written to <repo>/uploads and served statically at /uploads.
export const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per image
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME[file.mimetype]) cb(null, true);
    else cb(new Error('Only JPEG, PNG or WebP images are allowed'));
  },
});

// POST /api/upload — multipart field "file"; returns { url: "/uploads/<name>" }
router.post('/', authenticateToken, requireAccount, (req: AuthenticatedRequest, res: Response) => {
  upload.single('file')(req as any, res as any, (err: any) => {
    if (err) {
      res.status(400).json({ error: err.message || 'Upload failed' });
      return;
    }
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ error: 'Missing file' });
      return;
    }
    const name = `${crypto.randomUUID()}${ALLOWED_MIME[file.mimetype]}`;
    fs.writeFile(path.join(UPLOADS_DIR, name), file.buffer, (writeErr) => {
      if (writeErr) {
        console.error('upload write failed:', writeErr);
        res.status(500).json({ error: 'Server error' });
        return;
      }
      res.status(201).json({ url: `/uploads/${name}` });
    });
  });
});

export default router;
