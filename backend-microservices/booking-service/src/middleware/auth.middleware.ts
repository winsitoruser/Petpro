import { Request, Response, NextFunction } from 'express';

// Placeholder middleware for Express-style compatibility
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Mock authentication - replace with actual JWT verification
  req.user = { id: 'mock-user-id', role: 'customer' };
  next();
};