/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';

// Placeholder role middleware for Express-style compatibility
export const customerOnly = (req: Request, res: Response, next: NextFunction) => {
  // Mock role check - replace with actual role verification
  if ((req.user as any)?.role === 'customer' || (req.user as any)?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
};