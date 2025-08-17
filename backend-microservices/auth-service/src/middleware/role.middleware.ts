import { Request, Response, NextFunction } from 'express';

// Placeholder role middleware for Express-style compatibility
export const customerOnly = (req: Request, res: Response, next: NextFunction) => {
  // Mock role check - replace with actual role verification
  if (req.user?.role === 'customer' || req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};