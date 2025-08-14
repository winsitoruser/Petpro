/**
 * Repository Factory
 * 
 * Centralized factory for creating and accessing repository instances
 * with integrated Redis caching and performance monitoring.
 */
import { PrismaClient } from '@prisma/client';
import { prisma } from '../../../db/prisma';
import { cacheManager } from '../../../db/cacheManager';
import { logger } from '../../../utils/logger';

// Import repositories
import { UserRepository } from './userRepository';
import { PetRepository } from './petRepository';
import { ClinicRepository } from './clinicRepository';
import { NotificationRepository } from './notificationRepository';

// Add more repository imports as needed

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private prismaClient: PrismaClient;
  private repositories: Map<string, any>;

  private constructor(prismaClient: PrismaClient = prisma) {
    this.prismaClient = prismaClient;
    this.repositories = new Map();
    this.initializeRepositories();
    
    // Register shutdown handlers
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  /**
   * Get the RepositoryFactory instance (Singleton)
   */
  public static getInstance(prismaClient: PrismaClient = prisma): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(prismaClient);
    }
    return RepositoryFactory.instance;
  }

  /**
   * Initialize repositories
   */
  private initializeRepositories(): void {
    // Initialize and cache repository instances
    this.repositories.set('user', new UserRepository());
    this.repositories.set('pet', new PetRepository());
    this.repositories.set('clinic', new ClinicRepository());
    this.repositories.set('notification', new NotificationRepository());
    
    logger.info('Repository factory initialized', {
      repositoryCount: this.repositories.size,
      cacheEnabled: cacheManager.isAvailable()
    });
  }

  /**
   * Get User Repository
   */
  public getUserRepository(): UserRepository {
    return this.getRepository('user') as UserRepository;
  }

  /**
   * Get Pet Repository
   */
  public getPetRepository(): PetRepository {
    return this.getRepository('pet') as PetRepository;
  }

  /**
   * Get Clinic Repository
   */
  public getClinicRepository(): ClinicRepository {
    return this.getRepository('clinic') as ClinicRepository;
  }

  /**
   * Get Notification Repository
   */
  public getNotificationRepository(): NotificationRepository {
    return this.getRepository('notification') as NotificationRepository;
  }

  /**
   * Generic repository getter
   */
  private getRepository(name: string): any {
    const repository = this.repositories.get(name);
    
    if (!repository) {
      throw new Error(`Repository "${name}" not found`);
    }
    
    return repository;
  }

  /**
   * Check the health of all repositories and connections
   */
  public async healthCheck(): Promise<{
    database: boolean;
    cache: boolean;
    repositories: Record<string, boolean>;
  }> {
    const repositoryChecks: Record<string, boolean> = {};
    let allRepositoriesHealthy = true;
    
    // Check each repository's health
    for (const [name, repository] of this.repositories.entries()) {
      try {
        const isHealthy = await repository.checkHealth();
        repositoryChecks[name] = isHealthy;
        if (!isHealthy) allRepositoriesHealthy = false;
      } catch (error) {
        logger.error(`Repository "${name}" health check failed`, { 
          error: error instanceof Error ? error.message : String(error)
        });
        repositoryChecks[name] = false;
        allRepositoriesHealthy = false;
      }
    }
    
    // Check database connection
    let databaseHealthy = false;
    try {
      await this.prismaClient.$queryRaw`SELECT 1`;
      databaseHealthy = true;
    } catch (error) {
      logger.error('Database health check failed', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check cache connection
    const cacheHealthy = await cacheManager.healthCheck();
    
    return {
      database: databaseHealthy,
      cache: cacheHealthy,
      repositories: repositoryChecks
    };
  }

  /**
   * Get database metrics for monitoring
   */
  public async getDatabaseMetrics(): Promise<Record<string, any>> {
    try {
      // Query PostgreSQL for key metrics
      const connectionCount = await this.prismaClient.$queryRaw`
        SELECT count(*) as count FROM pg_stat_activity
      `;
      
      const databaseSize = await this.prismaClient.$queryRaw`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size, 
               pg_database_size(current_database()) as bytes
      `;
      
      const tableStats = await this.prismaClient.$queryRaw`
        SELECT 
          relname as table_name,
          n_live_tup as row_count,
          pg_size_pretty(pg_table_size(C.oid)) as table_size
        FROM 
          pg_class C
          LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
          LEFT JOIN pg_stat_user_tables stat ON stat.relname = C.relname
        WHERE 
          nspname = 'public'
          AND C.relkind = 'r'
        ORDER BY 
          n_live_tup DESC
        LIMIT 10
      `;
      
      const indexStats = await this.prismaClient.$queryRaw`
        SELECT
          indexrelname as index_name,
          relname as table_name,
          idx_scan as index_scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched,
          pg_size_pretty(pg_relation_size(indexrelid)) as index_size
        FROM 
          pg_stat_user_indexes
        ORDER BY 
          idx_scan DESC
        LIMIT 10
      `;
      
      const slowQueries = await this.prismaClient.$queryRaw`
        SELECT 
          query,
          calls,
          total_time,
          min_time,
          max_time,
          mean_time,
          rows
        FROM 
          pg_stat_statements
        ORDER BY 
          mean_time DESC
        LIMIT 10
      `;
      
      return {
        timestamp: new Date().toISOString(),
        connectionCount,
        databaseSize,
        tableStats,
        indexStats,
        slowQueries
      };
    } catch (error) {
      logger.error('Failed to collect database metrics', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        available: false
      };
    }
  }

  /**
   * Get cache metrics for monitoring
   */
  public async getCacheMetrics(): Promise<Record<string, any>> {
    if (!cacheManager.isAvailable()) {
      return {
        timestamp: new Date().toISOString(),
        available: false,
        error: 'Redis cache is not available'
      };
    }
    
    try {
      // Try to get Redis INFO stats
      const client = (cacheManager as any).client;
      if (!client) {
        return {
          timestamp: new Date().toISOString(),
          available: false,
          error: 'Redis client not accessible'
        };
      }
      
      const info = await client.info();
      const memory = await client.info('memory');
      const stats = await client.info('stats');
      
      // Parse the INFO output into an object
      const parseRedisInfo = (info: string): Record<string, string> => {
        const result: Record<string, string> = {};
        const lines = info.split('\r\n');
        
        for (const line of lines) {
          if (line && !line.startsWith('#')) {
            const parts = line.split(':');
            if (parts.length === 2) {
              result[parts[0]] = parts[1];
            }
          }
        }
        
        return result;
      };
      
      const infoObj = parseRedisInfo(info);
      const memoryObj = parseRedisInfo(memory);
      const statsObj = parseRedisInfo(stats);
      
      return {
        timestamp: new Date().toISOString(),
        available: true,
        version: infoObj.redis_version,
        uptime: infoObj.uptime_in_seconds,
        clients: infoObj.connected_clients,
        memory: {
          used: memoryObj.used_memory_human,
          peak: memoryObj.used_memory_peak_human,
          fragmentation: memoryObj.mem_fragmentation_ratio
        },
        stats: {
          keyspace_hits: statsObj.keyspace_hits,
          keyspace_misses: statsObj.keyspace_misses,
          hit_rate: statsObj.keyspace_hits && statsObj.keyspace_misses ? 
            (parseInt(statsObj.keyspace_hits, 10) / (parseInt(statsObj.keyspace_hits, 10) + parseInt(statsObj.keyspace_misses, 10)) * 100).toFixed(2) + '%' : '0%'
        }
      };
    } catch (error) {
      logger.error('Failed to collect cache metrics', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      return {
        timestamp: new Date().toISOString(),
        available: true,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Shutdown and cleanup
   */
  public async shutdown(): Promise<void> {
    try {
      logger.info('Repository factory shutting down');
      
      // Close cache connection if available
      if (cacheManager.isAvailable()) {
        await cacheManager.close();
      }
      
      // Clear repositories
      this.repositories.clear();
      
      logger.info('Repository factory shutdown complete');
    } catch (error) {
      logger.error('Error during repository factory shutdown', { 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

// Export a default singleton instance
export const repositoryFactory = RepositoryFactory.getInstance();

export default repositoryFactory;
