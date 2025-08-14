/**
 * EnhancedRepository Base Class
 * 
 * Provides common functionality for all repository implementations
 * including transaction management, logging, caching, and metrics
 */

import { PrismaClient } from '@prisma/client';
import prisma from '../../../db/prisma';
import { CacheManager } from '../../../db/cacheManager';
import { logger } from '../../../utils/logger';
import { measureQuery, measureTransaction, measureCache } from '../../../monitoring/metricsCollector';

/**
 * Base repository class that all specific repositories should extend
 */
export abstract class EnhancedRepository<T> {
  // Default instance of the Prisma client
  protected prisma: PrismaClient = prisma;
  
  // Optional cache manager instance
  protected cacheManager?: CacheManager;
  
  // Repository name for metrics and logging
  protected abstract readonly repositoryName: string;
  
  // Model name for metrics and logging
  protected abstract readonly modelName: string;
  
  /**
   * Set the cache manager instance for this repository
   * 
   * @param cacheManager - The cache manager instance
   */
  public setCacheManager(cacheManager: CacheManager): void {
    this.cacheManager = cacheManager;
  }
  
  /**
   * Set the Prisma client instance for this repository (useful for testing)
   * 
   * @param prismaClient - The Prisma client instance
   */
  public setPrisma(prismaClient: PrismaClient): void {
    this.prisma = prismaClient;
  }

  /**
   * Execute a database operation with metrics tracking
   * 
   * @param operation - The database operation (e.g., 'findMany', 'create')
   * @param method - The repository method name
   * @param queryFn - The function that executes the query
   * @returns The result of the query function
   */
  protected async executeQuery<R>(
    operation: string,
    method: string,
    queryFn: () => Promise<R>
  ): Promise<R> {
    try {
      return await measureQuery(
        operation,
        this.modelName,
        method,
        queryFn
      );
    } catch (error) {
      logger.error(`Error executing ${operation} in ${this.repositoryName}.${method}:`, error);
      throw error;
    }
  }

  /**
   * Execute a database transaction with metrics tracking
   * 
   * @param transactionFn - The function that executes the transaction
   * @returns The result of the transaction function
   */
  protected async executeTransaction<R>(
    transactionFn: () => Promise<R>
  ): Promise<R> {
    try {
      return await measureTransaction(transactionFn);
    } catch (error) {
      logger.error(`Transaction error in ${this.repositoryName}:`, error);
      throw error;
    }
  }

  /**
   * Get an item from cache or database with metrics tracking
   * 
   * @param cacheKey - The cache key
   * @param method - The repository method name
   * @param dbFn - The function to fetch data from database if not in cache
   * @param ttl - Optional TTL in seconds (defaults to repository default)
   * @returns The requested data from cache or database
   */
  protected async getFromCacheOrDb<R>(
    cacheKey: string,
    method: string,
    dbFn: () => Promise<R>,
    ttl?: number
  ): Promise<R> {
    // If no cache manager is available, execute the DB function directly
    if (!this.cacheManager) {
      return await this.executeQuery('uncached', method, dbFn);
    }
    
    try {
      // Try to get from cache first with metrics
      const cachedData = await measureCache<R | null>(
        'get',
        this.repositoryName,
        method,
        () => this.cacheManager!.get<R>(cacheKey)
      );
      
      // If found in cache, return it
      if (cachedData !== null) {
        return cachedData;
      }
      
      // If not in cache, get from DB
      const data = await this.executeQuery('fetch', method, dbFn);
      
      // Store in cache with metrics
      if (data !== null && data !== undefined) {
        await measureCache(
          'set',
          this.repositoryName,
          method,
          () => this.cacheManager!.set(cacheKey, data, ttl)
        );
      }
      
      return data;
    } catch (error) {
      logger.error(`Cache operation error in ${this.repositoryName}.${method}:`, error);
      // Fallback to DB if cache fails
      return await this.executeQuery('cache_fallback', method, dbFn);
    }
  }

  /**
   * Invalidate cache entries by pattern
   * 
   * @param pattern - The pattern to match cache keys
   * @param method - The repository method name causing the invalidation
   */
  protected async invalidateCache(pattern: string, method: string): Promise<void> {
    if (!this.cacheManager) return;
    
    try {
      await measureCache(
        'del',
        this.repositoryName,
        method,
        () => this.cacheManager!.delByPattern(pattern)
      );
    } catch (error) {
      logger.error(`Cache invalidation error in ${this.repositoryName}.${method}:`, error);
      // Continue execution even if cache invalidation fails
    }
  }

  /**
   * Check if the repository can connect to the database
   * 
   * @returns True if connected successfully, false otherwise
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Execute a simple query to check database connection
      await this.executeQuery('healthCheck', 'healthCheck', async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return true;
      });
      return true;
    } catch (error) {
      logger.error(`Health check failed for ${this.repositoryName}:`, error);
      return false;
    }
  }
}
