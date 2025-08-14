import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import config from '../config/env';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
const errorHandler = (err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = (err as AppError).statusCode || 500;
  const isOperational = (err as AppError).isOperational || false;

  // Log error
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.path} - ${err.message}`, { 
      stack: err.stack,
      path: req.path,
      body: req.body,
      query: req.query
    });
  } else {
    logger.warn(`${req.method} ${req.path} - ${err.message}`);
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    ...(config.isDevelopment && { stack: err.stack }),
    ...(config.isDevelopment && !isOperational && { note: 'Non-operational error occurred' })
  });
};

export default errorHandler;
