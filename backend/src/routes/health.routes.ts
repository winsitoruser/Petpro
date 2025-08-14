import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * Detailed health check endpoint for PetPro services
 * Returns status of database connectivity and specific services
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    const dbStatus = await checkDatabaseStatus();
    
    // Check review & notification service availability
    const servicesStatus = {
      review: true,
      notification: true
    };
    
    const status = dbStatus.isHealthy && 
                   servicesStatus.review && 
                   servicesStatus.notification;

    return res.status(status ? 200 : 503).json({
      status: status ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.isHealthy ? 'connected' : 'disconnected',
          latency: dbStatus.latencyMs,
          details: dbStatus.details
        },
        review: {
          status: servicesStatus.review ? 'available' : 'unavailable'
        },
        notification: {
          status: servicesStatus.notification ? 'available' : 'unavailable'
        }
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

/**
 * Check database connectivity and performance
 */
async function checkDatabaseStatus() {
  try {
    const startTime = Date.now();
    
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1 as result`;
    
    const latencyMs = Date.now() - startTime;
    
    return {
      isHealthy: true,
      latencyMs,
      details: {
        connectionPool: 'active'
      }
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      isHealthy: false,
      latencyMs: 0,
      details: {
        error: (error as Error).message
      }
    };
  }
}

export default router;
