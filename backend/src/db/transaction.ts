/**
 * Transaction Helper Utilities
 * 
 * Provides enhanced transaction management for database operations.
 */
import { PrismaClient } from '@prisma/client';
import prisma from './prisma';
import { logger } from '../utils/logger';

/**
 * Options for transaction execution
 */
interface TransactionOptions {
  maxRetries?: number;
  timeout?: number;
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  logQueries?: boolean;
}

/**
 * Executes a function within a transaction with retry capability and proper error handling
 * @param fn Function to execute within the transaction
 * @param options Transaction options
 * @returns Result of the transaction function
 */
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const { 
    maxRetries = 3, 
    timeout = 5000,
    isolationLevel = 'ReadCommitted',
    logQueries = false
  } = options;
  
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const startTime = performance.now();

      // Execute transaction with specified isolation level
      const result = await prisma.$transaction(
        async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">) => {
          // Create a wrapped transaction client that logs queries if enabled
          const txClient = logQueries
            ? createLoggingProxy(tx)
            : tx;
          
          return await Promise.race([
            fn(txClient),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error(`Transaction timeout after ${timeout}ms`)), timeout);
            })
          ]);
        },
        {
          isolationLevel,
          maxWait: timeout, // Max time to acquire connection
          timeout // Max time for the transaction
        }
      );

      const duration = Math.round(performance.now() - startTime);
      logger.info(`Transaction completed`, { duration, attempts });
      
      return result;
    } catch (error: any) {
      attempts++;
      
      // Check for specific error types that might benefit from retry
      const isDeadlockError = error.message?.includes('deadlock') || 
                             error.code === 'P2034';
      const isConnectionError = error.message?.includes('connection') || 
                              error.code === 'P2024';
      const isRetryable = isDeadlockError || isConnectionError;
      
      if (!isRetryable || attempts >= maxRetries) {
        logger.error(`Transaction failed permanently`, { 
          error: error.message,
          code: error.code,
          attempts
        });
        throw error;
      }
      
      const delay = Math.min(100 * Math.pow(2, attempts), 2000); // Exponential backoff
      logger.warn(`Transaction failed, retrying...`, { 
        error: error.message,
        code: error.code,
        attempt: attempts,
        nextRetryIn: delay
      });
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the throw in the catch block above
  throw new Error(`Transaction failed after ${maxRetries} attempts`);
}

/**
 * Creates a proxy around a Prisma transaction client that logs all queries
 * @param tx Prisma transaction client
 * @returns Proxy that logs all method calls
 */
function createLoggingProxy(tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">): typeof tx {
  return new Proxy(tx, {
    get(target, prop) {
      const original = target[prop as keyof typeof target];
      
      if (typeof original === 'object' && original !== null) {
        // Recursively wrap nested objects
        return createLoggingProxy(original as unknown as PrismaClient);
      }
      
      if (typeof original === 'function') {
        // Wrap methods to add logging
        return function(...args: any[]) {
          const startTime = performance.now();
          const result = original.apply(target, args);
          
          // Handle promises
          if (result instanceof Promise) {
            return result.then(resolved => {
              const duration = Math.round(performance.now() - startTime);
              const model = String(prop).split('.')[0];
              const operation = String(prop).split('.')[1] || 'unknown';
              
              logger.debug(`DB Query: ${model}.${operation}`, {
                duration,
                model,
                operation,
                args: JSON.stringify(args).substring(0, 200) // Limit log size
              });
              
              return resolved;
            }).catch(error => {
              logger.error(`DB Query Error: ${prop as string}`, {
                error: error.message,
                model: String(prop).split('.')[0],
                operation: String(prop).split('.')[1] || 'unknown'
              });
              throw error;
            });
          }
          
          return result;
        };
      }
      
      return original;
    }
  }) as PrismaClient;
}

/**
 * Creates a batch processor that executes operations in chunks to avoid memory issues
 * @param items Items to process
 * @param batchFn Function to process each batch
 * @param batchSize Size of each batch
 * @returns Results from all batches
 */
export async function processBatch<T, R>(
  items: T[],
  batchFn: (batch: T[]) => Promise<R[]>,
  batchSize = 100
): Promise<R[]> {
  const results: R[] = [];
  const totalItems = items.length;
  let processed = 0;
  
  logger.info(`Starting batch processing of ${totalItems} items`, {
    totalItems,
    batchSize
  });
  
  // Process in chunks
  for (let i = 0; i < totalItems; i += batchSize) {
    const startTime = performance.now();
    const batch = items.slice(i, i + batchSize);
    
    try {
      const batchResults = await batchFn(batch);
      results.push(...batchResults);
      processed += batch.length;
      
      const duration = Math.round(performance.now() - startTime);
      logger.info(`Batch processed`, {
        batchSize: batch.length,
        duration,
        progress: `${processed}/${totalItems} (${Math.round(processed/totalItems*100)}%)`
      });
    } catch (error: any) {
      logger.error(`Batch processing error`, {
        error: error.message,
        batchIndex: i,
        batchSize: batch.length
      });
      throw error;
    }
  }
  
  return results;
}
