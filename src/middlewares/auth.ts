import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: string;
    };
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ─── Guests ──────────────────────────────────────────────────────────────────
// A guest session is a signed token with no user row behind it: the mobile app
// gets one from POST /api/auth/guest so it can browse the whole catalogue
// without signing up. Guests may read; they may not create, change or delete
// anything, so every write route below the browse layer adds `requireAccount`.

export const GUEST_ROLE = 'GUEST';
export const GUEST_USER_ID = 'guest';

export function isGuest(req: AuthenticatedRequest): boolean {
  return req.user?.role === GUEST_ROLE;
}

/** Blocks guest sessions. Real accounts (CUSTOMER, CLEANER, ADMIN) pass through. */
export function requireAccount(req: Request, res: Response, next: NextFunction) {
  if ((req as AuthenticatedRequest).user?.role === GUEST_ROLE) {
    res.status(403).json({
      error: 'Create an account or sign in to continue',
      code: 'GUEST_ACCOUNT_REQUIRED',
    });
    return;
  }
  next();
}
