/**
 * Metrics Collector
 * 
 * Collects and exposes metrics for database and cache operations
 * Designed to work with Prometheus
 */
import * as promClient from 'prom-client';
import { logger } from '../utils/logger';

// Initialize metrics registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
promClient.collectDefaultMetrics({ register });

// Database metrics
export const dbMetrics = {
  // Query metrics
  queryDuration: new promClient.Histogram({
    name: 'petpro_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'model', 'method'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [register]
  }),
  
  queryTotal: new promClient.Counter({
    name: 'petpro_query_total',
    help: 'Total number of database queries',
    labelNames: ['operation', 'model', 'method'],
    registers: [register]
  }),
  
  slowQueries: new promClient.Counter({
    name: 'petpro_slow_queries_total',
    help: 'Total number of slow queries (queries taking more than 1 second)',
    labelNames: ['operation', 'model', 'method'],
    registers: [register]
  }),
  
  errorQueries: new promClient.Counter({
    name: 'petpro_error_queries_total',
    help: 'Total number of queries that resulted in an error',
    labelNames: ['operation', 'model', 'method', 'error_type'],
    registers: [register]
  }),
  
  // Transaction metrics
  transactionDuration: new promClient.Histogram({
    name: 'petpro_transaction_duration_seconds',
    help: 'Duration of database transactions in seconds',
    labelNames: ['result'], // 'commit' or 'rollback'
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    registers: [register]
  }),
  
  transactionTotal: new promClient.Counter({
    name: 'petpro_transaction_total',
    help: 'Total number of database transactions',
    labelNames: ['result'], // 'commit' or 'rollback'
    registers: [register]
  }),
  
  // Connection pool metrics
  connectionPoolSize: new promClient.Gauge({
    name: 'petpro_db_connection_pool_size',
    help: 'Current size of the database connection pool',
    registers: [register]
  }),
  
  connectionPoolActive: new promClient.Gauge({
    name: 'petpro_db_connection_pool_active',
    help: 'Number of active connections in the database connection pool',
    registers: [register]
  }),
  
  connectionPoolWaiting: new promClient.Gauge({
    name: 'petpro_db_connection_pool_waiting',
    help: 'Number of waiting requests for a connection in the database connection pool',
    registers: [register]
  })
};

// Cache metrics
export const cacheMetrics = {
  // Hit/miss metrics
  cacheHit: new promClient.Counter({
    name: 'petpro_cache_hit_total',
    help: 'Total number of cache hits',
    labelNames: ['repository', 'method'],
    registers: [register]
  }),
  
  cacheMiss: new promClient.Counter({
    name: 'petpro_cache_miss_total',
    help: 'Total number of cache misses',
    labelNames: ['repository', 'method'],
    registers: [register]
  }),
  
  // Operation metrics
  cacheOperation: new promClient.Counter({
    name: 'petpro_cache_operation_total',
    help: 'Total number of cache operations',
    labelNames: ['operation', 'repository', 'method'], // operation: get, set, del
    registers: [register]
  }),
  
  cacheOperationError: new promClient.Counter({
    name: 'petpro_cache_operation_error_total',
    help: 'Total number of cache operations that resulted in an error',
    labelNames: ['operation', 'repository', 'method', 'error_type'],
    registers: [register]
  }),
  
  cacheDuration: new promClient.Histogram({
    name: 'petpro_cache_duration_seconds',
    help: 'Duration of cache operations in seconds',
    labelNames: ['operation', 'repository', 'method'],
    buckets: [0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
    registers: [register]
  }),
  
  // Keys metrics
  cacheKeys: new promClient.Gauge({
    name: 'petpro_cache_keys',
    help: 'Current number of keys in the cache',
    labelNames: ['prefix'],
    registers: [register]
  }),
  
  cacheExpiredKeys: new promClient.Counter({
    name: 'petpro_cache_expired_keys_total',
    help: 'Total number of keys that expired from the cache',
    registers: [register]
  }),
  
  cacheEvictedKeys: new promClient.Counter({
    name: 'petpro_cache_evicted_keys_total',
    help: 'Total number of keys that were evicted from the cache',
    registers: [register]
  }),
  
  // Memory metrics
  cacheMemoryUsage: new promClient.Gauge({
    name: 'petpro_cache_memory_usage_bytes',
    help: 'Current memory usage of the cache in bytes',
    registers: [register]
  }),
  
  // Connection metrics
  cacheConnections: new promClient.Gauge({
    name: 'petpro_cache_connections',
    help: 'Current number of connections to the cache',
    registers: [register]
  })
};

/**
 * A wrapper to measure database query execution time and record metrics
 * 
 * @param operation - The database operation type (e.g., 'findMany', 'findUnique')
 * @param model - The Prisma model name (e.g., 'User', 'Pet')
 * @param method - The repository method name
 * @param queryFn - The function that executes the query
 * @returns The result of the query function
 */
export async function measureQuery<T>(
  operation: string,
  model: string,
  method: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const endTimer = dbMetrics.queryDuration.startTimer({
    operation,
    model,
    method
  });
  
  dbMetrics.queryTotal.inc({ operation, model, method });
  
  try {
    const result = await queryFn();
    const duration = endTimer();
    
    // Record slow queries (taking more than 1 second)
    if (duration > 1) {
      dbMetrics.slowQueries.inc({ operation, model, method });
      logger.warn(`Slow query detected: ${model}.${operation} in ${method} (${duration.toFixed(3)}s)`);
    }
    
    return result;
  } catch (error: any) {
    const errorType = error.name || 'Unknown';
    dbMetrics.errorQueries.inc({ operation, model, method, error_type: errorType });
    endTimer();
    throw error;
  }
}

/**
 * A wrapper to measure database transaction execution time and record metrics
 * 
 * @param transactionFn - The function that executes the transaction
 * @returns The result of the transaction function
 */
export async function measureTransaction<T>(
  transactionFn: () => Promise<T>
): Promise<T> {
  const endTimer = dbMetrics.transactionDuration.startTimer();
  
  try {
    const result = await transactionFn();
    dbMetrics.transactionTotal.inc({ result: 'commit' });
    endTimer({ result: 'commit' });
    return result;
  } catch (error) {
    dbMetrics.transactionTotal.inc({ result: 'rollback' });
    endTimer({ result: 'rollback' });
    throw error;
  }
}

/**
 * A wrapper to measure cache operation execution time and record metrics
 * 
 * @param operation - The cache operation type (e.g., 'get', 'set', 'del')
 * @param repository - The repository name
 * @param method - The repository method name
 * @param cacheFn - The function that executes the cache operation
 * @returns The result of the cache function
 */
export async function measureCache<T>(
  operation: 'get' | 'set' | 'del',
  repository: string,
  method: string,
  cacheFn: () => Promise<T>
): Promise<T> {
  const endTimer = cacheMetrics.cacheDuration.startTimer({
    operation,
    repository,
    method
  });
  
  cacheMetrics.cacheOperation.inc({ operation, repository, method });
  
  try {
    const result = await cacheFn();
    
    // Record hit/miss for get operations
    if (operation === 'get') {
      if (result === null || result === undefined) {
        cacheMetrics.cacheMiss.inc({ repository, method });
      } else {
        cacheMetrics.cacheHit.inc({ repository, method });
      }
    }
    
    endTimer();
    return result;
  } catch (error: any) {
    const errorType = error.name || 'Unknown';
    cacheMetrics.cacheOperationError.inc({
      operation,
      repository,
      method,
      error_type: errorType
    });
    endTimer();
    throw error;
  }
}

/**
 * Update the connection pool metrics
 * 
 * @param size - Total size of the connection pool
 * @param active - Number of active connections
 * @param waiting - Number of waiting requests
 */
export function updateConnectionPoolMetrics(size: number, active: number, waiting: number): void {
  dbMetrics.connectionPoolSize.set(size);
  dbMetrics.connectionPoolActive.set(active);
  dbMetrics.connectionPoolWaiting.set(waiting);
}

/**
 * Update the cache keys metrics
 * 
 * @param prefix - The key prefix
 * @param count - Number of keys with the prefix
 */
export function updateCacheKeysMetrics(prefix: string, count: number): void {
  cacheMetrics.cacheKeys.set({ prefix }, count);
}

/**
 * Update the cache memory usage metrics
 * 
 * @param memoryBytes - Memory usage in bytes
 */
export function updateCacheMemoryUsageMetrics(memoryBytes: number): void {
  cacheMetrics.cacheMemoryUsage.set(memoryBytes);
}

/**
 * Update the cache connections metrics
 * 
 * @param connections - Number of connections
 */
export function updateCacheConnectionsMetrics(connections: number): void {
  cacheMetrics.cacheConnections.set(connections);
}

/**
 * Get the metrics registry
 * 
 * @returns The metrics registry
 */
export function getMetricsRegistry(): promClient.Registry {
  return register;
}

/**
 * Get all metrics in Prometheus format
 * 
 * @returns A string containing all metrics in Prometheus format
 */
export async function getMetrics(): Promise<string> {
  return await register.metrics();
}
