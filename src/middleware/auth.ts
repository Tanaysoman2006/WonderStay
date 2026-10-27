import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/serverJwt.ts';

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    name: string;
    email: string;
    role: 'guest' | 'host';
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const decoded = verifyJWT(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  req.user = {
    sub: decoded.sub,
    name: decoded.name,
    email: decoded.email,
    role: decoded.role,
  };

  next();
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const decoded = verifyJWT(token);

  if (decoded) {
    req.user = {
      sub: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
  }

  next();
};

export const requireHost = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'host') {
    return res.status(403).json({ error: 'Host access is required for this action.' });
  }
  next();
};
