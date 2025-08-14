import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';
import logger from '../config/logger';

// Create async local storage to track request context
export const requestContext = new AsyncLocalStorage<Map<string, any>>();

// Define interface for tracked request
interface TrackedRequest extends Request {
  id?: string;
  startTime?: number;
}

/**
 * Middleware to track request lifecycle and add context to logs
 */
export const requestTracker = () => {
  return (req: TrackedRequest, res: Response, next: NextFunction) => {
    // Generate unique ID for the request
    const requestId = uuidv4();
    req.id = requestId;
    
    // Store request start time for performance tracking
    req.startTime = Date.now();
    
    // Create store with request data
    const store = new Map<string, any>();
    store.set('requestId', requestId);
    
    // Add user ID if available (from auth middleware)
    if (req.user?.id) {
      store.set('userId', req.user.id);
    }
    
    // Log incoming request with method and path
    logger.http(`Incoming request ${req.method} ${req.originalUrl}`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    // Handle response finish to log completion
    res.on('finish', () => {
      const responseTime = Date.now() - req.startTime!;
      const logLevel = res.statusCode >= 500 ? 'error' : 
                      res.statusCode >= 400 ? 'warn' : 'http';
      
      logger[logLevel](`Request completed ${req.method} ${req.originalUrl}`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime,
        contentLength: res.get('content-length'),
      });
    });
    
    // Run the next middleware in the async local storage context
    return requestContext.run(store, next);
  };
};

/**
 * Helper to get the current request ID from async local storage
 */
export const getRequestId = (): string | undefined => {
  const store = requestContext.getStore();
  return store?.get('requestId');
};

/**
 * Helper to get the current user ID from async local storage
 */
export const getUserId = (): string | undefined => {
  const store = requestContext.getStore();
  return store?.get('userId');
};

/**
 * Helper to set a value in the request context
 */
export const setRequestContext = (key: string, value: any): void => {
  const store = requestContext.getStore();
  if (store) {
    store.set(key, value);
  }
};

/**
 * Helper to get a value from the request context
 */
export const getRequestContext = (key: string): any => {
  const store = requestContext.getStore();
  return store?.get(key);
};
