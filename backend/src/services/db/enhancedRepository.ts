/**
 * Enhanced Repository Pattern
 * 
 * Provides an advanced repository pattern implementation with transaction management,
 * query optimization, caching, and advanced CRUD operations.
 */
import { PrismaClient } from '@prisma/client';
import { BaseService } from './baseService';
import { withTransaction } from '../../db/transaction';
import { connectionManager } from '../../db/connectionManager';
import { QueryOptimizer } from '../../db/queryOptimizer';
import { logger } from '../../utils/logger';

/**
 * Repository options for creating a new repository
 */
export interface RepositoryOptions {
  enableCache?: boolean;
  cacheTtl?: number;
  defaultSelect?: Record<string, boolean>;
  autoUseTransaction?: boolean;
  logging?: boolean;
}

/**
 * Enhanced repository providing advanced query and transaction capabilities
 */
export class EnhancedRepository<T extends Record<string, any>> extends BaseService<T> {
  // Default selection fields
  protected defaultSelect: Record<string, boolean>;
  
  // Transaction settings
  protected autoUseTransaction: boolean;
  
  // Cache settings
  protected enableCache: boolean;
  protected cacheTtl: number;
  
  // Performance tracking
  private queryPerformance: {
    [operation: string]: {
      count: number;
      totalDuration: number;
      lastDuration: number;
    };
  } = {};

  constructor(model: string, options: RepositoryOptions = {}) {
    super(model);
    
    this.defaultSelect = options.defaultSelect || { id: true };
    this.autoUseTransaction = options.autoUseTransaction || false;
    this.enableCache = options.enableCache || false;
    this.cacheTtl = options.cacheTtl || 60; // seconds
    
    if (options.logging) {
      logger.info(`Enhanced repository initialized for ${model}`, {
        model,
        enableCache: this.enableCache,
        cacheTtl: this.cacheTtl,
        autoUseTransaction: this.autoUseTransaction
      });
    }
  }
  
  /**
   * Find an entity by ID with optimized query
   */
  async findById(
    id: string, 
    options: { 
      select?: Record<string, boolean>; 
      include?: Record<string, any>;
      useCache?: boolean;
    } = {}
  ): Promise<T | null> {
    const startTime = performance.now();
    const cacheKey = `${this.model}:${id}:${JSON.stringify(options)}`;
    
    try {
      // Apply query optimizations
      const queryOptions = {
        where: { id },
        ...this.getOptimizedSelection(options)
      };
      
      const result = await (this.prisma as any)[this.model].findUnique(queryOptions);
      
      // Track performance
      this.trackQueryPerformance('findById', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.findById`, {
        id,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Find many entities with optimized query
   */
  async findMany(
    args: any = {}, 
    options: {
      useTransaction?: boolean;
      optimizationOptions?: {
        scalarOnly?: boolean;
        useCursorPagination?: boolean;
      };
    } = {}
  ): Promise<T[]> {
    const startTime = performance.now();
    const useTransaction = options.useTransaction ?? this.autoUseTransaction;
    
    try {
      // Optimize query arguments
      const optimizedArgs = QueryOptimizer.optimizeFindMany(
        this.model, 
        args, 
        {
          scalarOnly: options.optimizationOptions?.scalarOnly,
          useCursorPagination: options.optimizationOptions?.useCursorPagination
        }
      );
      
      let result: T[];
      
      if (useTransaction) {
        // Execute in transaction for consistency
        result = await withTransaction(async (tx) => {
          return (tx as any)[this.model].findMany(optimizedArgs);
        });
      } else {
        // Execute without transaction for speed
        result = await (this.prisma as any)[this.model].findMany(optimizedArgs);
      }
      
      // Track performance
      this.trackQueryPerformance('findMany', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.findMany`, {
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Create an entity with transaction support
   */
  async create(
    data: any,
    options: {
      useTransaction?: boolean;
      select?: Record<string, boolean>;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    const useTransaction = options.useTransaction ?? this.autoUseTransaction;
    
    try {
      let result: T;
      
      const createArgs = {
        data,
        ...this.getOptimizedSelection(options)
      };
      
      if (useTransaction) {
        // Execute in transaction
        result = await withTransaction(async (tx) => {
          return (tx as any)[this.model].create(createArgs);
        });
      } else {
        // Execute without transaction
        result = await (this.prisma as any)[this.model].create(createArgs);
      }
      
      // Track performance
      this.trackQueryPerformance('create', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.create`, {
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Update an entity with transaction support
   */
  async update(
    id: string,
    data: any,
    options: {
      useTransaction?: boolean;
      select?: Record<string, boolean>;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    const useTransaction = options.useTransaction ?? this.autoUseTransaction;
    
    try {
      let result: T;
      
      const updateArgs = {
        where: { id },
        data,
        ...this.getOptimizedSelection(options)
      };
      
      if (useTransaction) {
        // Execute in transaction
        result = await withTransaction(async (tx) => {
          return (tx as any)[this.model].update(updateArgs);
        });
      } else {
        // Execute without transaction
        result = await (this.prisma as any)[this.model].update(updateArgs);
      }
      
      // Track performance
      this.trackQueryPerformance('update', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.update`, {
        id,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Delete an entity with transaction support
   */
  async delete(
    id: string,
    options: {
      useTransaction?: boolean;
      permanent?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    const useTransaction = options.useTransaction ?? this.autoUseTransaction;
    const permanent = options.permanent ?? false;
    
    try {
      let result: T;
      
      if (permanent) {
        // Perform hard delete
        if (useTransaction) {
          result = await withTransaction(async (tx) => {
            return (tx as any)[this.model].delete({
              where: { id }
            });
          });
        } else {
          result = await (this.prisma as any)[this.model].delete({
            where: { id }
          });
        }
      } else {
        // Perform soft delete
        const currentDate = new Date();
        
        if (useTransaction) {
          result = await withTransaction(async (tx) => {
            return (tx as any)[this.model].update({
              where: { id },
              data: { deletedAt: currentDate }
            });
          });
        } else {
          result = await (this.prisma as any)[this.model].update({
            where: { id },
            data: { deletedAt: currentDate }
          });
        }
      }
      
      // Track performance
      this.trackQueryPerformance('delete', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.delete`, {
        id,
        permanent,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Upsert an entity with transaction support
   */
  async upsert(
    where: any,
    create: any,
    update: any,
    options: {
      useTransaction?: boolean;
      select?: Record<string, boolean>;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    const useTransaction = options.useTransaction ?? this.autoUseTransaction;
    
    try {
      let result: T;
      
      const upsertArgs = {
        where,
        create,
        update,
        ...this.getOptimizedSelection(options)
      };
      
      if (useTransaction) {
        // Execute in transaction
        result = await withTransaction(async (tx) => {
          return (tx as any)[this.model].upsert(upsertArgs);
        });
      } else {
        // Execute without transaction
        result = await (this.prisma as any)[this.model].upsert(upsertArgs);
      }
      
      // Track performance
      this.trackQueryPerformance('upsert', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.upsert`, {
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Count entities with filter
   */
  async count(where: any = {}): Promise<number> {
    const startTime = performance.now();
    
    try {
      const result = await (this.prisma as any)[this.model].count({ where });
      
      // Track performance
      this.trackQueryPerformance('count', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.count`, {
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Find first entity matching criteria
   */
  async findFirst(
    args: any = {},
    options: {
      useTransaction?: boolean;
      select?: Record<string, boolean>;
    } = {}
  ): Promise<T | null> {
    const startTime = performance.now();
    const useTransaction = options.useTransaction ?? this.autoUseTransaction;
    
    try {
      let result: T | null;
      
      const queryArgs = {
        ...args,
        ...this.getOptimizedSelection(options)
      };
      
      if (useTransaction) {
        // Execute in transaction
        result = await withTransaction(async (tx) => {
          return (tx as any)[this.model].findFirst(queryArgs);
        });
      } else {
        // Execute without transaction
        result = await (this.prisma as any)[this.model].findFirst(queryArgs);
      }
      
      // Track performance
      this.trackQueryPerformance('findFirst', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.findFirst`, {
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Execute a raw query with the model's table
   * Warning: Use with caution as this bypasses Prisma's type safety
   */
  async executeRaw(
    query: string, 
    parameters: any[] = [],
    options: {
      useTransaction?: boolean;
    } = {}
  ): Promise<any> {
    const startTime = performance.now();
    const useTransaction = options.useTransaction ?? this.autoUseTransaction;
    
    try {
      let result: any;
      
      if (useTransaction) {
        // Execute in transaction
        result = await withTransaction(async (tx) => {
          return tx.$executeRawUnsafe(query, ...parameters);
        });
      } else {
        // Execute without transaction
        result = await this.prisma.$executeRawUnsafe(query, ...parameters);
      }
      
      // Track performance
      this.trackQueryPerformance('executeRaw', startTime);
      
      return result;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.executeRaw`, {
        query: query.substring(0, 100),
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Execute a batch operation with transaction support
   * This method automatically chunks large datasets to prevent memory issues
   */
  async executeBatch<R>(
    items: any[],
    operation: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">, chunk: any[]) => Promise<R[]>,
    options: {
      batchSize?: number;
      useTransaction?: boolean;
    } = {}
  ): Promise<R[]> {
    const batchSize = options.batchSize || 100;
    const useTransaction = options.useTransaction ?? this.autoUseTransaction;
    const startTime = performance.now();
    const results: R[] = [];
    
    try {
      // Process in chunks to avoid memory issues
      for (let i = 0; i < items.length; i += batchSize) {
        const chunk = items.slice(i, i + batchSize);
        
        let batchResults: R[];
        
        if (useTransaction) {
          // Execute in transaction
          batchResults = await withTransaction(async (tx) => {
            return operation(tx, chunk);
          });
        } else {
          // Execute without transaction
          batchResults = await operation(this.prisma, chunk);
        }
        
        results.push(...batchResults);
        
        logger.debug(`Batch processed for ${this.model}`, {
          batchSize: chunk.length,
          totalProcessed: i + chunk.length,
          totalItems: items.length
        });
      }
      
      // Track performance
      this.trackQueryPerformance('executeBatch', startTime);
      
      return results;
    } catch (error: any) {
      logger.error(`Error in ${this.model}.executeBatch`, {
        itemCount: items.length,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Get query performance statistics
   */
  getPerformanceStats(): Record<string, any> {
    return Object.entries(this.queryPerformance).reduce((stats, [operation, data]) => {
      stats[operation] = {
        count: data.count,
        avgDuration: data.count > 0 ? Math.round(data.totalDuration / data.count) : 0,
        lastDuration: data.lastDuration
      };
      return stats;
    }, {} as Record<string, any>);
  }
  
  /**
   * Get the connection status for this repository
   */
  async checkConnection(): Promise<{ isConnected: boolean; latency: number }> {
    const startTime = performance.now();
    
    try {
      // Simple query to check connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        isConnected: true,
        latency: Math.round(performance.now() - startTime)
      };
    } catch (error) {
      return {
        isConnected: false,
        latency: -1
      };
    }
  }
  
  /**
   * Get optimized field selection based on options and defaults
   */
  private getOptimizedSelection(options: { 
    select?: Record<string, boolean>;
    include?: Record<string, any>;
  } = {}): { select?: Record<string, boolean>; include?: Record<string, any> } {
    // If explicit selection is provided, use it
    if (options.select) {
      return { select: options.select };
    }
    
    // If include is provided, use it
    if (options.include) {
      return { include: options.include };
    }
    
    // Otherwise use default selection
    return { select: this.defaultSelect };
  }
  
  /**
   * Track query performance for monitoring and optimization
   */
  private trackQueryPerformance(operation: string, startTime: number): void {
    const duration = performance.now() - startTime;
    
    if (!this.queryPerformance[operation]) {
      this.queryPerformance[operation] = {
        count: 0,
        totalDuration: 0,
        lastDuration: 0
      };
    }
    
    this.queryPerformance[operation].count++;
    this.queryPerformance[operation].totalDuration += duration;
    this.queryPerformance[operation].lastDuration = duration;
  }
}
