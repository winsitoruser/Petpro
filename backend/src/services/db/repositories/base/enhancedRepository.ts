/**
 * Enhanced Repository Base Class
 *
 * Provides enhanced functionality for repositories including:
 * - Metrics collection for all database operations
 * - Caching support with automatic invalidation
 * - Standardized error handling and logging
 */
import { PrismaClient } from '@prisma/client';
import { MetricsCollector } from '../../../../monitoring/metricsCollectorClass';
import { CacheManager } from '../../../cache/cacheManager';
import { logger } from '../../../../utils/logger';

/**
 * Base options for repository operations
 */
export interface RepositoryOptions {
  /** Whether to bypass cache for this operation */
  skipCache?: boolean;
  /** Custom cache TTL for this operation */
  cacheTtl?: number;
  /** Additional context for logging */
  context?: Record<string, any>;
}

/**
 * Abstract base class for enhanced repositories
 * @template T The primary model type this repository handles
 */
export abstract class EnhancedRepository<T> {
  /** Repository name used for metrics and cache key prefixes */
  protected readonly repositoryName: string;
  
  /** Prisma client for database operations */
  protected readonly prisma: PrismaClient;
  
  /** Metrics collector for instrumentation */
  protected readonly metrics: MetricsCollector;
  
  /** Cache manager for caching operations */
  protected readonly cache: CacheManager;
  
  /** Default cache TTL in seconds (5 minutes) */
  protected readonly defaultCacheTtl: number = 300;
  
  /** Whether caching is enabled for this repository */
  protected readonly cachingEnabled: boolean = true;

  /**
   * Create a new repository instance
   * 
   * @param repositoryName - Name of the repository (for metrics and caching)
   * @param prisma - Prisma client instance
   * @param metricsCollector - Metrics collector instance
   * @param cacheManager - Cache manager instance
   */
  constructor(
    repositoryName: string,
    prisma: PrismaClient,
    metricsCollector: MetricsCollector,
    cacheManager: CacheManager
  ) {
    this.repositoryName = repositoryName;
    this.prisma = prisma;
    this.metrics = metricsCollector;
    this.cache = cacheManager;
    
    logger.debug(`Initialized ${repositoryName}`);
  }

  /**
   * Executes a database query with metrics collection
   * 
   * @param operation - The database operation (e.g., 'findMany', 'create')
   * @param model - The model name (e.g., 'User', 'Pet')
   * @param method - The repository method name
   * @param queryFn - The function that executes the query
   * @returns The result of the query
   */
  protected async executeQuery<R>(
    operation: string,
    model: string,
    method: string,
    queryFn: () => Promise<R>
  ): Promise<R> {
    return this.metrics.measureQuery(
      operation,
      model,
      method,
      queryFn
    );
  }

  /**
   * Executes a database transaction with metrics collection
   * 
   * @param transactionFn - The function that executes the transaction
   * @returns The result of the transaction
   */
  protected async executeTransaction<R>(
    transactionFn: () => Promise<R>
  ): Promise<R> {
    return this.metrics.measureTransaction(transactionFn);
  }

  /**
   * Generates a cache key for the repository following the structured naming convention
   * 
   * @param method - Method name
   * @param params - Parameters to include in the cache key
   * @returns A cache key string
   */
  protected generateCacheKey(method: string, params: Record<string, any> = {}): string {
    const env = process.env.NODE_ENV || 'dev';
    const modelName = this.getModelName().toLowerCase();
    
    // Format parameters for the cache key
    const normalizedParams = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => {
        // Handle special types for cache key generation
        if (typeof value === 'object' && value !== null) {
          if (Array.isArray(value)) {
            return `${key}=${value.join(',')}`;
          } else if (value instanceof Date) {
            return `${key}=${value.toISOString()}`;
          }
          return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${key}=${encodeURIComponent(String(value))}`;
      })
      .join(':');
      
    // Structure: petpro:{environment}:{entity-type}:{operation}:{identifiers}
    return `petpro:${env}:${modelName}:${method}${normalizedParams ? `:${normalizedParams}` : ''}`;
  }

  /**
   * Executes a function with caching
   * 
   * @param method - Method name for metrics and cache key
   * @param params - Parameters for cache key generation
   * @param fn - Function to execute if cache miss
   * @param options - Repository options
   * @returns The cached or freshly computed result
   */
  protected async withCache<R>(
    method: string,
    params: Record<string, any>,
    fn: () => Promise<R>,
    options: RepositoryOptions = {}
  ): Promise<R> {
    // Skip cache if disabled globally or for this operation
    if (!this.cachingEnabled || options.skipCache) {
      return fn();
    }
    
    const cacheKey = this.generateCacheKey(method, params);
    
    try {
      // Try to get from cache first
      const cachedResult = await this.cache.get<R>(cacheKey, {
        repository: this.repositoryName,
        method
      });
      
      if (cachedResult !== null) {
        // Cache hit
        return cachedResult;
      }
      
      // Cache miss, execute function
      const result = await fn();
      
      // Store in cache if result exists
      if (result !== null && result !== undefined) {
        await this.cache.set(
          cacheKey,
          result,
          options.cacheTtl || this.defaultCacheTtl,
          { repository: this.repositoryName, method }
        );
      }
      
      return result;
    } catch (error: any) {
      // Log cache error but don't fail the operation
      logger.warn(`Cache error in ${this.repositoryName}.${method}`, {
        error: error.message,
        ...(options.context || {})
      });
      
      // Fall back to direct execution
      return fn();
    }
  }

  /**
   * Invalidates cache entries for this repository
   * 
   * @param keyOrPattern - Specific cache key or pattern to invalidate
   * @returns Number of keys invalidated
   */
  protected async invalidateCache(keyOrPattern?: string): Promise<number> {
    try {
      const env = process.env.NODE_ENV || 'dev';
      const modelName = this.getModelName();
      
      // Create appropriate invalidation pattern based on input
      let pattern: string;
      
      if (!keyOrPattern) {
        // Invalidate all repository keys
        pattern = `petpro:${env}:${modelName.toLowerCase()}:*`;
      } else if (keyOrPattern.includes('*')) {
        // Already a pattern
        pattern = keyOrPattern;
      } else if (keyOrPattern.includes(':')) {
        // Specific key with parameters
        pattern = keyOrPattern;
        return await this.cache.del(pattern, {
          repository: this.repositoryName,
          method: 'invalidate-specific'
        });
      } else {
        // Method name
        pattern = `petpro:${env}:${modelName.toLowerCase()}:${keyOrPattern}:*`;
      }
      
      const keysRemoved = await this.cache.delByPattern(pattern, {
        repository: this.repositoryName,
        method: 'invalidate-pattern'
      });
      
      logger.debug(`Invalidated ${keysRemoved} keys with pattern: ${pattern}`, {
        repository: this.repositoryName
      });
      
      return keysRemoved;
    } catch (error: any) {
      logger.warn(`Failed to invalidate cache for ${this.repositoryName}`, {
        error: error.message,
        keyOrPattern
      });
      return 0;
    }
  }
  
  /**
   * Invalidates cache entries related to a specific entity ID
   * 
   * @param entityId - ID of the entity to invalidate
   * @returns Number of keys invalidated
   */
  protected async invalidateEntityCache(entityId: string | number): Promise<number> {
    try {
      const env = process.env.NODE_ENV || 'dev';
      const modelName = this.getModelName();
      const idField = `${modelName.toLowerCase()}Id`;
      
      const pattern = `petpro:${env}:${modelName.toLowerCase()}:*:*${idField}=${entityId}*`;
      
      const keysRemoved = await this.cache.delByPattern(pattern, {
        repository: this.repositoryName,
        method: 'invalidate-entity'
      });
      
      logger.debug(`Invalidated ${keysRemoved} keys for ${modelName} ID: ${entityId}`, {
        repository: this.repositoryName
      });
      
      return keysRemoved;
    } catch (error: any) {
      logger.warn(`Failed to invalidate entity cache for ${this.repositoryName}`, {
        error: error.message,
        entityId
      });
      return 0;
    }
  }
  
  /**
   * Gets the model name for this repository
   * Repositories should either override this method or define a 'modelName' property
   */
  protected getModelName(): string {
    // Check if derived class has a modelName property
    if ('modelName' in this && typeof (this as any).modelName === 'string') {
      return (this as any).modelName;
    }
    
    // Fallback to repository name without 'Repository' suffix
    const name = this.repositoryName.replace('Repository', '');
    logger.warn(`Repository ${this.repositoryName} is missing modelName property, using derived name: ${name}`);
    return name;
  }
}
