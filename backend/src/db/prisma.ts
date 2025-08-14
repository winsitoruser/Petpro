/**
 * PetPro Prisma Client Service
 * 
 * This file provides the central Prisma client instance for database interactions.
 * It includes middleware for audit logging, transaction tracking, and query optimization.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { queryLogger } from './queryLogger';

// Add type declaration for global.currentUserId
declare global {
  var currentUserId: string | null;
  var queryCount: number;
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Initialize query counter for the current request
global.queryCount = global.queryCount || 0;

/**
 * Create a new Prisma client with optimized settings
 */
const prismaClientSingleton = () => {
  const prismaOptions = {
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
    // Add connection throttling for high-load environments
    throttle: process.env.NODE_ENV === 'production' ? {
      usageLimit: parseInt(process.env.PRISMA_THROTTLE_LIMIT || '100', 10),
      timeWindow: parseInt(process.env.PRISMA_THROTTLE_WINDOW || '1000', 10)
    } : undefined
  };

  return new PrismaClient(prismaOptions);
};

// Singleton pattern for Prisma client to prevent multiple instances during hot reloading
const prisma = globalThis.prisma ?? prismaClientSingleton();

// Only attach event listeners if the methods exist (not in test environment)
if (typeof prisma.$on === 'function') {
  // Attach query logger for advanced analysis
  queryLogger.attachToPrisma(prisma);

  // Debug query logging in development mode
  if (process.env.NODE_ENV !== 'production') {
    prisma.$on('query', (e: any) => {
      // Count queries per request for N+1 detection
      global.queryCount++;

      if (process.env.DEBUG_PRISMA === 'true') {
        logger.debug(`Query: ${e.query}`, {
          params: e.params,
          duration: `${e.duration}ms`,
          timestamp: e.timestamp,
        });
      }
    });
  }

  // Log errors with enhanced context
  prisma.$on('error', (e: any) => {
    logger.error('Prisma Error', { 
      error: e.message,
      target: e.target,
      code: e.code,
      meta: e.meta
    });
  });
}

// Setup middleware for audit logging, performance tracking, and query optimization
if (typeof prisma.$use === 'function') {
  // Middleware for audit logging
  prisma.$use(async (params: any, next: any) => {
    // Skip middleware for read operations
    if (params.action === 'findUnique' || 
        params.action === 'findFirst' || 
        params.action === 'findMany' || 
        params.action === 'count') {
      return next(params);
    }
    
    // Track start time for performance monitoring
    const startTime = performance.now();
    
    // Get current user ID from context for audit trail
    const userId = global.currentUserId || null;
    
    // Execute the database operation
    const result = await next(params);
    
    // Only log write operations for audit purposes
    if (params.action === 'create' || 
        params.action === 'update' || 
        params.action === 'delete' || 
        params.action === 'upsert') {
      
      // Calculate operation duration
      const duration = Math.round(performance.now() - startTime);
      
      // Log the operation
      logger.info(`DB Operation: ${params.model}.${params.action}`, {
        model: params.model,
        action: params.action,
        duration,
        userId,
        recordId: result?.id || null,
      });
    }
    
    return result;
  });

  // Middleware for query optimization on large result sets
  prisma.$use(async (params: any, next: any) => {
    // Only optimize read operations
    if (params.action === 'findMany') {
      // Add automatic pagination for large result sets with no explicit limit
      if (!params.args.take && !params.args.skip) {
        const DEFAULT_MAX_RESULTS = 1000;
        params.args.take = DEFAULT_MAX_RESULTS;
        logger.warn(`Unlimited query detected for ${params.model}.${params.action}, applying automatic limit`, {
          model: params.model,
          limit: DEFAULT_MAX_RESULTS
        });
      }

      // Check for potential N+1 query patterns
      const queryCountBeforeOperation = global.queryCount || 0;
      const result = await next(params);
      
      // If this query generated lots of follow-up queries, it might be an N+1 problem
      const queriesGenerated = (global.queryCount || 0) - queryCountBeforeOperation;
      if (queriesGenerated > 10 && result?.length > 0) {
        logger.warn(`Potential N+1 query pattern detected in ${params.model}.${params.action}`, {
          model: params.model,
          resultCount: result.length,
          queriesGenerated,
          ratio: queriesGenerated / result.length
        });
      }
      
      return result;
    }
    
    return next(params);
  });
}

// Handle app shutdown gracefully
process.on('SIGINT', async () => {
  logger.info('Application shutdown initiated, disconnecting database');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Application termination signal received, disconnecting database');
  await prisma.$disconnect();
  process.exit(0);
});

// Export the singleton instance
export default prisma;

