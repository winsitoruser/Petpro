/**
 * Query Optimizer
 * 
 * Provides utilities and techniques to optimize database queries.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Options for optimizing queries
 */
interface OptimizationOptions {
  // Batch size for large operations
  batchSize?: number;
  
  // Timeout for query execution
  timeout?: number;
  
  // Fields to select from the result (projection optimization)
  select?: Record<string, boolean>;
  
  // When true, returns only scalar fields and excludes relations unless specified
  scalarOnly?: boolean;
  
  // Whether to use cursors for pagination
  useCursorPagination?: boolean;
  
  // Index hint to use (advanced)
  indexHint?: string;
}

// Field selection templates for common use cases
export const SelectionTemplates = {
  minimal: {
    id: true,
    createdAt: true,
    updatedAt: true
  },
  userBasic: {
    id: true,
    email: true,
    userType: true,
    active: true
  },
  userDetailed: {
    id: true,
    email: true,
    userType: true,
    active: true,
    emailVerified: true,
    phoneVerified: true,
    createdAt: true,
    updatedAt: true,
    profile: {
      select: {
        firstName: true,
        lastName: true,
        displayName: true,
        profileImage: true
      }
    }
  }
};

/**
 * Class providing query optimization utilities
 */
export class QueryOptimizer {
  /**
   * Optimize a findMany query
   * @param model Prisma model to query
   * @param args Base query arguments
   * @param options Optimization options
   */
  static optimizeFindMany<T extends Record<string, any>>(
    model: string,
    args: any,
    options: OptimizationOptions = {}
  ): any {
    const optimizedArgs = { ...args };
    
    // Apply select optimization if specified
    if (options.select) {
      optimizedArgs.select = options.select;
    } else if (options.scalarOnly && !optimizedArgs.select && !optimizedArgs.include) {
      // Auto-generate select for scalar fields only
      optimizedArgs.select = this.getScalarFieldsSelect(model);
    }
    
    // Apply pagination optimization
    if (options.useCursorPagination && optimizedArgs.skip) {
      // Convert offset pagination to cursor pagination for better performance
      const take = optimizedArgs.take || 10;
      const skip = optimizedArgs.skip || 0;
      const cursorField = this.getPrimaryKeyField(model) || 'id';
      
      // We'll need orderBy for cursor pagination
      if (!optimizedArgs.orderBy) {
        optimizedArgs.orderBy = { [cursorField]: 'asc' };
      }
      
      // For larger offsets, use cursor pagination
      if (skip > 100) {
        // Note: This requires an initial query to find the cursor position
        // We're omitting that complexity here but it would be implemented
        // as a separate query to find the record at the desired skip position
        logger.debug('Large offset detected, consider implementing cursor pagination', {
          model,
          skip,
          take
        });
      }
    }

    return optimizedArgs;
  }

  /**
   * Process large datasets in batches to prevent memory issues
   * @param model Prisma model to query
   * @param where Where condition
   * @param processFn Function to process each batch
   * @param options Batch options
   */
  static async processBatched<T, R>(
    prisma: PrismaClient,
    model: string,
    where: any,
    processFn: (items: T[]) => Promise<R[]>,
    options: { 
      batchSize?: number; 
      orderBy?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<R[]> {
    const batchSize = options.batchSize || 500;
    const orderBy = options.orderBy || { id: 'asc' };
    const results: R[] = [];
    let lastId: string | null = null;
    let hasMore = true;
    let totalProcessed = 0;
    
    // Set a timeout to prevent infinite processing
    const timeout = options.timeout || 30000; // 30 seconds default
    const startTime = Date.now();
    
    // Process in batches using cursor pagination
    while (hasMore && (Date.now() - startTime < timeout)) {
      let cursorCondition = {};
      
      // Apply cursor condition for subsequent batches
      if (lastId) {
        // This assumes id ordering
        cursorCondition = { id: { gt: lastId } };
      }
      
      // Get current batch
      const items = await (prisma as any)[model].findMany({
        where: {
          ...where,
          ...cursorCondition
        },
        take: batchSize,
        orderBy
      });
      
      if (items.length === 0) {
        hasMore = false;
        break;
      }
      
      // Process current batch
      const batchResults = await processFn(items as T[]);
      results.push(...batchResults);
      
      // Update cursor for next batch
      lastId = items[items.length - 1].id;
      totalProcessed += items.length;
      
      // Check if we have more items to process
      hasMore = items.length === batchSize;
      
      logger.debug(`Batch processed for ${model}`, {
        batchSize: items.length,
        totalProcessed,
        hasMore
      });
    }
    
    if (Date.now() - startTime >= timeout) {
      logger.warn(`Batch processing timed out for ${model}`, {
        timeout,
        totalProcessed
      });
    }
    
    return results;
  }

  /**
   * Create optimized select object for relations
   * This prevents over-fetching by explicitly selecting only needed fields
   */
  static createOptimizedInclude(
    relations: Record<string, boolean | Record<string, any>>
  ): Record<string, any> {
    const optimized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(relations)) {
      // If relation is just marked as true, optimize it by selecting only id
      if (value === true) {
        optimized[key] = {
          select: { id: true }
        };
      } 
      // If specific fields are already selected, use them as is
      else if (typeof value === 'object') {
        optimized[key] = value;
      }
    }
    
    return optimized;
  }

  /**
   * Get a selection object for scalar fields only
   */
  private static getScalarFieldsSelect(model: string): Record<string, boolean> {
    // In a real implementation, we would get this from Prisma's DMMF
    // Here we're providing a simplified implementation with common fields
    
    // Common scalar fields found in most models
    const commonFields = {
      id: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true
    };
    
    // Model-specific scalar fields
    const modelFields: Record<string, Record<string, boolean>> = {
      user: {
        ...commonFields,
        email: true,
        userType: true,
        active: true,
        emailVerified: true,
        phoneVerified: true,
        phone: true,
        lastLogin: true
      },
      notification: {
        ...commonFields,
        userId: true,
        title: true,
        content: true,
        read: true
      },
      // Add other models as needed
    };
    
    return modelFields[model] || commonFields;
  }

  /**
   * Get the primary key field for a model
   */
  private static getPrimaryKeyField(model: string): string | null {
    // In a real implementation, we would get this from Prisma's DMMF
    // For now, we'll assume 'id' is the primary key for all models
    return 'id';
  }
}

/**
 * Apply eager loading optimization to a query
 * This helps prevent N+1 query problems
 */
export function withEagerLoading<T>(
  baseQuery: any,
  relations: string[]
): any {
  // Start with existing include
  const include = baseQuery.include || {};
  
  // Add all requested relations
  for (const relation of relations) {
    if (relation.includes('.')) {
      // Handle nested relations (e.g., 'profile.addresses')
      const [parent, child] = relation.split('.');
      
      if (!include[parent]) {
        include[parent] = { include: {} };
      } else if (!include[parent].include) {
        include[parent].include = {};
      }
      
      include[parent].include[child] = true;
    } else {
      // Handle direct relations
      include[relation] = true;
    }
  }
  
  return {
    ...baseQuery,
    include
  };
}

/**
 * Create a query with pagination that automatically uses
 * the most efficient pagination strategy based on the offset
 */
export function createPaginatedQuery(
  baseQuery: any,
  pagination: { page?: number; pageSize?: number; cursor?: string }
): any {
  const { page = 1, pageSize = 10, cursor } = pagination;
  const skip = (page - 1) * pageSize;
  
  // For small offsets, use skip/take
  if (skip < 500 || !cursor) {
    return {
      ...baseQuery,
      skip,
      take: pageSize
    };
  }
  
  // For larger offsets, use cursor-based pagination
  return {
    ...baseQuery,
    cursor: { id: cursor },
    take: pageSize
  };
}
