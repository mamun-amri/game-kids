import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db.js';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: '30d',
  });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as {
      id: number;
      email: string;
    };
    const result = await query<AuthUser>(
      'SELECT id, email, name FROM parents WHERE id = $1',
      [payload.id],
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Account not found' });
    }
    req.user = result.rows[0];
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
