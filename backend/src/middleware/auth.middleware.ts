import { Request, Response, NextFunction } from 'express';

/**
 * Simple authentication middleware (demo mode)
 * In production, this should validate JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // For demo purposes, always allow access
  // In production, validate Authorization header with JWT
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    // For demo, we'll allow requests without auth
    // In production, return 401
    // return res.status(401).json({ success: false, error: 'No token provided' });
  }

  // Mock user for demo
  (req as any).user = {
    id: 1,
    username: 'demo',
    role: 'admin',
  };

  next();
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    next();
  };
};

