/**
 * Cache Manager
 * 
 * Manages cache operations with Redis integration and metrics collection
 * Includes fallback strategies, monitoring, and resilience features
 */
import Redis from 'ioredis';
import { logger } from '../../utils/logger';
import { MetricsCollector } from '../../monitoring/metricsCollectorClass';
import { EventEmitter } from 'events';
import NodeCache from 'node-cache';

/**
 * Memory usage statistics for cache
 */
export interface CacheMemoryStats {
  /** Total memory usage in bytes */
  totalBytes: number;
  /** RSS memory usage in bytes */
  rssBytes: number;
  /** Maximum memory limit in bytes */
  maxMemoryBytes: number;
  /** Number of keys in cache */
  keysCount: number;
  /** Average key size in bytes */
  avgKeySize: number;
  /** Average value size in bytes */
  avgValueSize: number;
  /** Peak memory usage in bytes */
  peakBytes: number;
  /** Memory fragmentation ratio */
  fragmentationRatio: number;
  /** Whether memory limit has been reached */
  limitReached: boolean;
  /** Percentage of memory limit used */
  usagePercentage: number;
}

/**
 * Memory limit policies for cache eviction
 */
export enum CacheEvictionPolicy {
  /** Least Recently Used - remove items accessed least recently */
  LRU = 'lru',
  /** Least Frequently Used - remove items accessed least frequently */
  LFU = 'lfu',
  /** First In First Out - remove oldest items first */
  FIFO = 'fifo',
  /** Random eviction - remove random items */
  RANDOM = 'random',
  /** TTL-based - remove items closest to expiry */
  TTL = 'ttl'
}

/**
 * Options for memory limits configuration
 */
export interface CacheMemoryOptions {
  /** Maximum memory usage in MB for Redis */
  redisMaxMemoryMB?: number;
  /** Maximum items in local cache */
  localMaxItems?: number;
  /** Eviction policy for Redis */
  redisEvictionPolicy?: CacheEvictionPolicy;
  /** Eviction policy for local cache */
  localEvictionPolicy?: CacheEvictionPolicy;
  /** Memory usage warning threshold (percentage) */
  memoryWarningThreshold?: number;
  /** Memory usage critical threshold (percentage) */
  memoryCriticalThreshold?: number;
  /** Whether to track key size distribution */
  trackKeySizeDistribution?: boolean;
}

/**
 * Options for cache operations
 */
export interface CacheOptions {
  /** TTL in seconds */
  ttl?: number;
  /** Repository name for metrics */
  repository?: string;
  /** Method name for metrics */
  method?: string;
  /** Whether to use local memory cache as backup */
  useLocalFallback?: boolean;
  /** Priority level for the cache operation */
  priority?: 'high' | 'medium' | 'low';
  /** Whether to wait for cache operation to complete */
  blocking?: boolean;
  /** Operation source for metrics (redis, local, etc) */
  source?: string;
  /** Additional context for logging */
  context?: Record<string, any>;
  /** Whether to retry on failure */
  retry?: boolean;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in ms */
  retryDelay?: number;
}

/**
 * CacheManager provides a unified interface to cache operations
 * with built-in metrics collection and error handling
 */
export class CacheManager extends EventEmitter {
  private redis!: Redis; // Definitely assigned in constructor via connectToRedis
  private metricsCollector!: MetricsCollector; // Definitely assigned in constructor
  private localCache!: NodeCache; // Definitely assigned in constructor
  private defaultTtl: number = 300; // 5 minutes default TTL
  private redisAvailable: boolean = true;
  
  // Redis health check and connection management
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelayMs: number = 5000; // 5 seconds
  
  // Memory management and limits
  private memoryStatsInterval: NodeJS.Timeout | null = null;
  private memoryStats: CacheMemoryStats = {
    totalBytes: 0,
    rssBytes: 0,
    maxMemoryBytes: 0,
    keysCount: 0,
    avgKeySize: 0,
    avgValueSize: 0,
    peakBytes: 0,
    fragmentationRatio: 1,
    limitReached: false,
    usagePercentage: 0
  };
  private readonly memoryOptions: CacheMemoryOptions = {
    redisMaxMemoryMB: 100,           // 100MB default max memory for Redis
    localMaxItems: 1000,              // 1000 items default for local cache
    redisEvictionPolicy: CacheEvictionPolicy.LRU,
    localEvictionPolicy: CacheEvictionPolicy.LRU,
    memoryWarningThreshold: 80,       // 80% warning threshold
    memoryCriticalThreshold: 95,      // 95% critical threshold
    trackKeySizeDistribution: true
  };
  private keySizeDistribution: Map<string, number> = new Map(); // prefix -> size

  /**
   * Creates a new CacheManager instance
   * 
   * @param redisUrl - Redis connection URL (default: from environment)
   * @param options - Cache manager options
  constructor(
    redisUrl?: string, 
    options: { 
      localTtl?: number;
      checkHealthInterval?: number; 
      enableAutomaticReconnect?: boolean;
      memoryOptions?: CacheMemoryOptions;
      memoryStatsInterval?: number;
    } = {}
  ) {
    super();
    const { 
      localTtl = 60, // 1 minute default local TTL
      checkHealthInterval = 30000, // 30 seconds
      enableAutomaticReconnect = true,
      memoryOptions = {},
      memoryStatsInterval = 60000 // 1 minute default memory stats interval
    } = options;
    
    // Apply memory options
    this.applyMemoryOptions(memoryOptions);
    
    // Initialize metrics collector first so it's available for all operations
    this.metricsCollector = new MetricsCollector();
    
    // Initialize local in-memory cache as fallback
    this.localCache = new NodeCache({
      stdTTL: localTtl,
      checkperiod: localTtl * 0.2, // Check for expired keys at 20% of TTL
      useClones: false, // For better performance
      maxKeys: 1000 // Limit to prevent memory leaks
    });
    
    // Setup cache events listeners
    this.on('redis:available', (isAvailable: boolean) => {
      // Track Redis availability status changes in metrics
      this.metricsCollector.incrementCounter('redis_availability_change_total', {
        available: String(isAvailable)
      });
    });
    
    // Connect to Redis
    this.connectToRedis(redisUrl);
    
    // Setup periodic health check if enabled
    if (enableAutomaticReconnect && checkHealthInterval > 0) {
      // Use startHealthCheck instead of manually setting interval
      this.startHealthCheck();
    }
    
    // Start memory stats collection if interval is positive
    if (memoryStatsInterval > 0) {
      this.startMemoryTracking(memoryStatsInterval);
    }
  }
  
  /**
   * Connect to Redis with retry capability
   * 
   * @param redisUrl - Optional Redis connection URL
   */
  private connectToRedis(redisUrl?: string): void {
    try {
      const connectionUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redis = new Redis(connectionUrl, {
        // Exponential backoff with jitter
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 500, 5000) + Math.random() * 500;
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            // Force reconnect on specific Redis errors
            return true;
          }
          return false;
        }
      });
      
      // Set up Redis event handlers
      this.redis.on('error', (error) => {
        logger.error(`Redis connection error: ${error.message}`);
        this.handleConnectionError(error);
      });
      
      this.redis.on('ready', () => {
        if (!this.redisAvailable) {
          logger.info('Redis connection restored');
          this.redisAvailable = true;
          this.reconnectAttempts = 0;
          this.emit('redis:available', true);
        }
      });
      
      this.redis.on('end', () => {
        logger.warn('Redis connection ended');
        this.redisAvailable = false;
        this.emit('redis:available', false);
      });
      
      this.redis.on('reconnecting', (delay: number) => {
        logger.info(`Reconnecting to Redis in ${delay}ms`);
        this.emit('redis:reconnecting', delay);
      });
      
      // Start health check interval
      this.startHealthCheck();
      
    } catch (error: any) {
      logger.error('Failed to connect to Redis', { error: error.message });
      this.redisAvailable = false;
      this.emit('redis:connection_failed', error);
      
      // Create a fallback implementation that doesn't actually cache
      this.redis = {
        get: async () => null,
        set: async () => 'OK',
        del: async () => 0,
        scan: async () => ['0', []] as [string, string[]]
      } as unknown as Redis;
    }
  }

  /**
   * Gets a value from cache
   * 
   * @param key - Cache key
   * @param options - Cache options
   * @returns The cached value, or null if not found
   */
  /**
   * Checks the health of the Redis connection
   * 
   * @returns True if Redis is available, false otherwise
   */
  public async checkHealth(): Promise<boolean> {
    try {
      if (!this.redis) return false;
      
      const startTime = Date.now();
      const pong = await this.redis.ping();
      const latencyMs = Date.now() - startTime;
      
      // Record Redis ping latency
      this.metricsCollector.recordRedisLatency(latencyMs, {
        operation: 'ping',
        status: pong === 'PONG' ? 'success' : 'error'
      });
      
      const isHealthy = pong === 'PONG';
      
      // If status changed, update and emit event
      if (isHealthy !== this.redisAvailable) {
        this.redisAvailable = isHealthy;
        this.emit('redis:available', isHealthy);
        
        if (isHealthy) {
          logger.info('Redis connection is healthy');
        } else {
          logger.warn('Redis connection is unhealthy');
        }
      }
      
      return isHealthy;
    } catch (error: any) {
      if (this.redisAvailable) {
        logger.error(`Redis health check failed: ${error.message}`);
        this.redisAvailable = false;
        this.emit('redis:available', false);
      }
      
      return false;
    }
  }
  
  /**
   * Handles Redis connection errors and attempts reconnection
   * 
   * @param error - The connection error
   */
  private handleConnectionError(error: Error): void {
    this.redisAvailable = false;
    this.emit('redis:available', false);
    
    // Only attempt reconnection if we haven't exceeded the limit
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      if (!this.reconnectTimeout) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1);
        
        logger.info(`Attempting to reconnect to Redis in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        this.reconnectTimeout = setTimeout(() => {
          this.reconnectTimeout = null;
          try {
            // Force a new connection
            this.redis.connect();
          } catch (err: any) {
            logger.error(`Reconnection attempt failed: ${err.message}`);
          }
        }, delay);
      }
    } else {
      logger.error(`Maximum Redis reconnection attempts (${this.maxReconnectAttempts}) exceeded`);
      this.emit('redis:max_retries_exceeded');
    }
  }
  
  /**
   * Starts periodic health checks for Redis connection
   */
  private startHealthCheck(): void {
    // Clear any existing interval first
    this.stopHealthCheck();
    
    // Check Redis health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      try {
        if (this.redis) {
          const startTime = Date.now();
          await this.redis.ping();
          const pingTime = Date.now() - startTime;
          
          if (!this.redisAvailable) {
            logger.info('Redis health check passed, connection restored');
            this.redisAvailable = true;
            this.reconnectAttempts = 0;
            this.emit('redis:available', true);
          }
          
          // Record ping latency metrics
          this.metricsCollector.recordRedisLatency(pingTime, { operation: 'ping' });
        }
      } catch (error: any) {
        if (this.redisAvailable) {
          logger.warn(`Redis health check failed: ${error.message}`);
          this.redisAvailable = false;
          this.emit('redis:available', false);
        }
      }
    }, 30000); // 30 seconds interval
  }
  
  /**
   * Stops the Redis health check interval
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
  
  /**
   * Gets a value from cache with fallback to local cache if Redis is unavailable
   * Includes memory usage awareness and metrics
   * 
   * @param key - Cache key
   * @param options - Cache options
   * @returns The cached value, or null if not found
   */
  public async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { 
      repository = 'unknown', 
      method = 'unknown', 
      useLocalFallback = true,
      priority = 'medium' 
    } = options;
    
    return this.metricsCollector.measureCache('get', repository, method, async () => {
      // Track the prefix for metrics
      const prefixMatch = key.match(/^([^:]+):/);
      const prefix = prefixMatch ? prefixMatch[1] : 'other';
      
      // For extremely low priority operations, may skip cache during high memory pressure
      if (priority === 'low' && 
          this.memoryStats.usagePercentage > (this.memoryOptions.memoryCriticalThreshold || 95)) {
        logger.debug(`Skipping low priority cache get for ${key} due to critical memory usage`, {
          usagePercentage: this.memoryStats.usagePercentage.toFixed(2),
          repository,
          method
        });
        
        // Track skipped operation
        this.metricsCollector.incrementCounter('cache_operations_skipped_total', {
          repository, 
          method,
          operation: 'get',
          reason: 'memory_critical'
        });
        
        return null;
      }
      
      // Try local cache first if enabled
      if (useLocalFallback) {
        const localValue = this.localCache.get<T>(key);
        if (localValue !== undefined) {
          this.metricsCollector.incrementCacheHits('local', repository, method);
          
          // Track local cache hit by prefix
          this.metricsCollector.incrementCounter('cache_hit_by_prefix_total', {
            repository,
            method,
            prefix,
            source: 'local'
          });
          
          return localValue;
        }
      }
      
      // Then try Redis if available
      if (this.redisAvailable) {
        try {
          const startTime = Date.now();
          const value = await this.redis.get(key);
          const responseTime = Date.now() - startTime;
          
          // Record Redis latency
          this.metricsCollector.recordRedisLatency(responseTime);
          
          if (!value) {
            this.metricsCollector.incrementCacheMisses(repository, method);
            
            // Track cache miss by prefix
            this.metricsCollector.incrementCounter('cache_miss_by_prefix_total', {
              repository,
              method,
              prefix
            });
            
            return null;
          }
          
          // Track memory used for this response
          const valueSize = value.length;
          this.metricsCollector.observeHistogram('cache_response_size_bytes', {
            repository,
            method,
            prefix
          }, valueSize);
          
          const parsed = JSON.parse(value) as T;
          
          // Store in local cache for future use if size is reasonable
          if (useLocalFallback) {
            const localSizeThreshold = 100 * 1024; // 100KB threshold for local cache
            if (valueSize <= localSizeThreshold) {
              const localTtl = options.ttl ? Math.min(options.ttl, 60) : 60; // Max 1 minute for local cache
              this.localCache.set(key, parsed, localTtl);
            }
          }
          
          this.metricsCollector.incrementCacheHits('redis', repository, method);
          
          // Track Redis cache hit by prefix
          this.metricsCollector.incrementCounter('cache_hit_by_prefix_total', {
            repository,
            method,
            prefix,
            source: 'redis'
          });
          
          return parsed;
        } catch (error: any) {
          logger.error('Redis cache get error', {
            key,
            repository,
            method,
            error: error.message,
          });
          
          // Mark Redis as unavailable if this is a connection error
          if (error.message.includes('connection') || 
              error.message.includes('timeout') || 
              error.message.includes('network')) {
            this.redisAvailable = false;
            this.emit('redis:available', false);
          }
          
          // We'll fall through to return null
        }
      }
      
      this.metricsCollector.incrementCacheMisses(repository, method);
      return null;
    });
  }

  /**
   * Sets a value in cache with fallback to local cache when Redis is unavailable
   * Also handles memory limits and tracks key size metrics
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time-to-live in seconds (optional)
   * @param options - Cache options
   * @returns Success status
   */
  public async set(
    key: string,
    value: any,
    ttl?: number,
    options: CacheOptions = {}
  ): Promise<boolean> {
    const { 
      repository = 'unknown', 
      method = 'unknown', 
      useLocalFallback = true,
      priority = 'medium',
      blocking = true,
      retry = true,
      maxRetries = 3,
      retryDelay = 50
    } = options;
    
    return this.metricsCollector.measureCache('set', repository, method, async () => {
      // Skip low priority items if memory usage is high
      const warningThreshold = this.memoryOptions.memoryWarningThreshold || 80;
      if (priority === 'low' && 
          this.memoryStats.usagePercentage > warningThreshold) {
        logger.debug(`Skipping low priority cache set for ${key} due to high memory usage`, {
          usagePercentage: this.memoryStats.usagePercentage.toFixed(2),
          repository,
          method
        });
        
        // Track skipped cache operation
        this.metricsCollector.incrementCounter('cache_operations_skipped_total', {
          repository,
          method,
          reason: 'memory_pressure'
        });
        
        return false;
      }

      // Get the effective TTL to use
      const effectiveTtl = ttl || options.ttl || this.defaultTtl;
      
      // Serialize the value once for both Redis and size checking
      const serializedValue = JSON.stringify(value);
      
      // Estimate the size of the value
      const estimatedSize = new TextEncoder().encode(serializedValue).length;
      
      // Check if the size is too large for caching
      const sizeThresholdBytes = 1024 * 1024; // 1MB threshold
      if (estimatedSize > sizeThresholdBytes) {
        logger.warn(`Cache value for ${key} exceeds size threshold (${Math.round(estimatedSize/1024)}KB)`, {
          repository,
          method,
          sizeKB: Math.round(estimatedSize/1024)
        });
        
        // Track oversized items
        this.metricsCollector.incrementCounter('cache_oversized_items_total', {
          repository,
          method,
          size_range: estimatedSize > 5 * sizeThresholdBytes ? '5mb_plus' : '1mb_to_5mb'
        });
        
        // Skip caching for very large items
        if (estimatedSize > 5 * sizeThresholdBytes) {
          return false;
        }
        
        // For large items, use a shorter TTL
        const adjustedTtl = Math.max(Math.floor(effectiveTtl / 3), 60);
        logger.debug(`Reducing TTL for large item from ${effectiveTtl}s to ${adjustedTtl}s`, {
          repository,
          method,
          key
        });
        options.ttl = adjustedTtl;
      }
      
      // Track key size by prefix (namespace)
      const prefixMatch = key.match(/^([^:]+):/);
      const prefix = prefixMatch ? prefixMatch[1] : 'other';
      
      // Always set in local cache if fallback is enabled and size is reasonable
      if (useLocalFallback) {
        const localSizeThreshold = 100 * 1024; // 100KB threshold for local cache
        if (estimatedSize <= localSizeThreshold) {
          const localTtl = options.ttl ? Math.min(options.ttl, 60) : 60; // Max 1 minute for local cache
          this.localCache.set(key, value, localTtl);
        } else {
          // Log that we're skipping local cache due to size
          logger.debug(`Skipping local cache for large key ${key} (${Math.round(estimatedSize/1024)}KB)`, {
            repository,
            method
          });
        }
      }
      
      // If memory usage is near critical, enforce limits before setting
      const criticalThreshold = this.memoryOptions.memoryCriticalThreshold || 95;
      if (this.memoryStats.usagePercentage >= criticalThreshold * 0.9) {
        await this.enforceMemoryLimits();
      }
      
      // Only attempt Redis if it's available
      let success = useLocalFallback; // Default to true if local cache was used
      if (this.redisAvailable) {
        let lastError = null;
        let attempts = 0;
        
        do {
          try {
            const startTime = Date.now();
            
            // For non-blocking operations, use a promise that resolves immediately
            if (!blocking && priority !== 'high') {
              // Fire and forget
              this.redis.set(key, serializedValue, 'EX', effectiveTtl)
                .then(() => {
                  // Record metrics on success
                  this.metricsCollector.observeHistogram('cache_key_size_bytes', {
                    repository,
                    method,
                    prefix
                  }, estimatedSize);
                })
                .catch(error => {
                  logger.error('Async cache set error', {
                    key, repository, method, error: error.message
                  });
                  
                  // If this is a memory error, try to enforce limits
                  if (error.message.includes('OOM') || error.message.includes('memory')) {
                    this.enforceMemoryLimits().catch(e => {
                      logger.error('Failed to enforce memory limits after OOM', { error: e.message });
                    });
                  }
                });
              return true;
            }
            
            // For blocking operations or high priority
            await this.redis.set(key, serializedValue, 'EX', effectiveTtl);
            
            const responseTime = Date.now() - startTime;
            this.metricsCollector.recordRedisLatency(responseTime);
            
            // Record size metrics
            this.metricsCollector.observeHistogram('cache_key_size_bytes', {
              repository,
              method,
              prefix
            }, estimatedSize);
            
            success = true;
            break;
          } catch (error: any) {
            lastError = error;
            attempts++;
            
            // If this is a memory error, try to enforce limits and retry
            if (error.message.includes('OOM') || error.message.includes('memory')) {
              logger.warn('Redis memory error during cache set operation', {
                key,
                repository,
                method,
                error: error.message
              });
              
              // Try to free some memory
              await this.enforceMemoryLimits();
              
              // Record OOM incident
              this.metricsCollector.incrementCounter('cache_out_of_memory_total', {
                repository,
                method,
                operation: 'set'
              });
            }
            
            // Log the error if we've exceeded retry attempts
            if (!retry || attempts > maxRetries) {
              logger.error(`Failed to set cache key ${key} in Redis after ${attempts} attempts`, {
                error: error.message,
                repository,
                method
              });
              break;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
          }
        } while (attempts <= maxRetries);
        
        // If Redis operation failed but local cache was set, still return true
        if (!success && useLocalFallback) {
          logger.debug(`Redis cache set failed for ${key}, using local fallback`, {
            repository,
            method
          });
          
          // Track fallback usage in metrics
          this.metricsCollector.incrementCounter('repository_cache_fallback_total', {
            repository,
            method,
            operation: 'set',
            reason: lastError ? 'error' : 'redis_unavailable'
          });
        }
      }
      
      return success;
    });
  }

  /**
   * Deletes a value from cache
   * 
   * @param key - Cache key to delete
   * @param options - Cache options
   * @returns Number of keys removed
   */
  /**
   * Deletes a value from cache with fallback to local cache
   * 
   * @param key - Cache key to delete
   * @param options - Cache options
   * @returns Number of keys removed
   */
  public async del(key: string, options: CacheOptions = {}): Promise<number> {
    const { 
      repository = 'unknown', 
      method = 'unknown', 
      useLocalFallback = true,
      priority = 'medium',
      blocking = true
    } = options;
    
    return this.metricsCollector.measureCache('del', repository, method, async () => {
      let redisRemoved = 0;
      let localRemoved = 0;
      
      // Always remove from local cache if fallback is enabled
      if (useLocalFallback) {
        localRemoved = this.localCache.del(key) ? 1 : 0;
      }
      
      // Only attempt Redis if it's available
      if (this.redisAvailable) {
        try {
          const startTime = Date.now();
          
          // For non-blocking operations, use a promise that resolves immediately
          if (!blocking && priority !== 'high') {
            // Fire and forget
            this.redis.del(key)
              .catch(error => {
                logger.error('Async cache del error', {
                  key, repository, method, error: error.message
                });
              });
            // Return the local removal count since we don't wait for Redis
            return localRemoved;
          }
          
          // For blocking operations or high priority
          redisRemoved = await this.redis.del(key);
          
          const responseTime = Date.now() - startTime;
          this.metricsCollector.recordRedisLatency(responseTime);
          
          return Math.max(redisRemoved, localRemoved);
        } catch (error: any) {
          logger.error('Cache del error', {
            key,
            repository,
            method,
            error: error.message,
          });
          
          this.redisAvailable = false;
          // Return the local removal count since Redis failed
          return localRemoved;
        }
      }
      
      return localRemoved;
    });
  }

  /**
   * Deletes multiple keys from cache matching a pattern
   * 
   * @param pattern - Pattern to match keys (e.g., "user:*")
   * @param options - Cache options
   * @returns Number of keys removed
   */
  /**
   * Deletes multiple keys from cache matching a pattern with local fallback
   * Supports Redis glob patterns (e.g., "petpro:dev:pet:*")
   * 
   * @param pattern - Pattern to match keys (e.g., "petpro:dev:pet:*")
   * @param options - Cache options
   * @returns Number of keys removed
   */
  public async delByPattern(
    pattern: string,
    options: CacheOptions = {}
  ): Promise<number> {
    const { 
      repository = 'unknown', 
      method = 'unknown', 
      useLocalFallback = true, 
      priority = 'medium',
      retry = true,
      maxRetries = 2,
      retryDelay = 500 
    } = options;
    
    let totalRemoved = 0;
    let attempts = 0;
    let lastError: Error | null = null;
    
    // Use the cache operation queue based on priority
    // Use direct timing rather than measureCache since delByPattern isn't an enum option
    const startTime = Date.now();
    try {
      // Always delete from local cache first if enabled
      if (useLocalFallback) {
        const localKeys = this.localCache.keys();
        const matchingLocalKeys = localKeys.filter(key => {
          // Convert Redis glob pattern to RegExp
          const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.')
            .replace(/\[([^\]]+)\]/g, '[${1}]');
          
          const regex = new RegExp(`^${regexPattern}$`);
          return regex.test(key);
        });
        
        // Delete matching keys from local cache
        if (matchingLocalKeys.length > 0) {
          matchingLocalKeys.forEach(key => {
            if (this.localCache.del(key)) {
              totalRemoved++;
            }
          });
          
          // Log local cache invalidations
          logger.debug(`Deleted ${matchingLocalKeys.length} keys from local cache matching pattern ${pattern}`, {
            repository,
            method
          });
        }
      }
      
      // Retry loop for Redis operations
      do {
        // Only attempt Redis if it's available
        if (this.redisAvailable) {
          try {
            const startTime = Date.now();
            
            // Use scan to find keys matching the pattern
            const keys: string[] = [];
            let cursor = '0';
            
            do {
              // Scan for keys matching the pattern
              const [nextCursor, scanKeys] = await this.redis.scan(
                cursor,
                'MATCH',
                pattern,
                'COUNT',
                100
              );
              
              cursor = nextCursor;
              keys.push(...scanKeys);
            } while (cursor !== '0');
            
            // No keys found in Redis
            if (keys.length === 0) {
              // Record attempt in metrics even when no keys found
              this.metricsCollector.incrementCounter('repository_cache_invalidation_attempts_total', {
                repository,
                method,
                pattern_matched: 'false',
                status: 'success'
              });
              
              return totalRemoved; // Return any local removed keys
            }
            
            // Delete all found keys from Redis
            let redisRemoved = 0;
            if (keys.length > 0) {
              // Handle differently if there's just one key or multiple keys
              if (keys.length === 1) {
                redisRemoved = await this.redis.del(keys[0]);
              } else {
                // For multiple keys, use pipeline for efficiency
                const pipeline = this.redis.pipeline();
                for (const key of keys) {
                  pipeline.del(key);
                }
                const results = await pipeline.exec();
                // Count successful deletions
                redisRemoved = results ? results.filter(r => r[0] === null && r[1] === 1).length : 0;
              }
            }
            
            const responseTime = Date.now() - startTime;
            this.metricsCollector.recordRedisLatency(responseTime, {
              operation: 'delByPattern',
              pattern_type: pattern.includes('*') ? 'wildcard' : 'exact',
              keys_count: String(keys.length)
            });
            
            // Track pattern invalidation metrics
            this.metricsCollector.incrementCounter('repository_cache_invalidations_total', {
              repository,
              method,
              pattern_matched: 'true',
              keys_count: String(redisRemoved)
            });
            
            // Log successful pattern deletion
            logger.debug(`Deleted ${redisRemoved} keys matching pattern ${pattern}`, {
              repository,
              method,
              keys_deleted: redisRemoved,
              keys_found: keys.length
            });
            
            return redisRemoved + totalRemoved;
          } catch (error: any) {
            lastError = error;
            attempts++;
            
            // Log error
            logger.error(`Cache delByPattern error (attempt ${attempts}/${maxRetries+1})`, {
              pattern,
              repository,
              method,
              error: error.message,
            });
            
            // Track failed invalidation in metrics
            this.metricsCollector.incrementCounter('repository_cache_invalidation_errors_total', {
              repository,
              method,
              error_type: error.code || 'unknown'
            });
            
            // If this is a connection error, mark Redis as unavailable
            if (error.message.includes('connection') || error.message.includes('timeout')) {
              this.redisAvailable = false;
              this.emit('redis:available', false);
              break; // Exit the retry loop
            }
            
            // If retry is disabled or we've reached max retries, break the loop
            if (!retry || attempts > maxRetries) {
              break;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
          }
        } else {
          // Redis is unavailable, break the retry loop
          break;
        }
      } while (attempts <= maxRetries);
      
      // If we reached here with no success, log the final status
      if (lastError) {
        logger.warn(`Cache invalidation for pattern ${pattern} failed after ${attempts} attempts`, {
          repository,
          method,
          error: lastError.message
        });
      }
      
      return totalRemoved;
    } finally {
      const duration = Date.now() - startTime;
      // Record the operation time manually
      this.metricsCollector.incrementCounter('repository_cache_operation_total', {
        repository,
        method,
        operation: 'delByPattern',
        status: lastError ? 'error' : 'success'
      });
      
      this.metricsCollector.observeHistogram('repository_cache_operation_seconds', {
        repository, 
        method,
        operation: 'delByPattern'
      }, duration / 1000);
    }
  }

  /**
   * Applies memory options to the cache
   * 
   * @param options - Memory options to apply
   */
  private applyMemoryOptions(options: Partial<CacheMemoryOptions>): void {
    // Merge with default options
    Object.assign(this.memoryOptions, options);
    
    // Apply options to local cache if needed
    if (options.localMaxItems) {
      this.localCache.options.maxKeys = options.localMaxItems;
    }
    
    // Log memory configuration
    logger.debug('Cache memory limits configured', {
      redisMaxMemoryMB: this.memoryOptions.redisMaxMemoryMB,
      localMaxItems: this.memoryOptions.localMaxItems,
      redisEvictionPolicy: this.memoryOptions.redisEvictionPolicy,
      warningThreshold: this.memoryOptions.memoryWarningThreshold,
      criticalThreshold: this.memoryOptions.memoryCriticalThreshold
    });
  }
  
  /**
   * Starts periodic tracking of memory usage statistics
   * 
   * @param intervalMs - Interval in milliseconds
   */
  private startMemoryTracking(intervalMs: number = 60000): void {
    // Clear any existing interval
    if (this.memoryStatsInterval) {
      clearInterval(this.memoryStatsInterval);
      this.memoryStatsInterval = null;
    }
    
    // Create new tracking interval
    this.memoryStatsInterval = setInterval(async () => {
      await this.updateMemoryStats();
    }, intervalMs);
    
    logger.debug(`Memory usage tracking started with ${intervalMs}ms interval`);
  }
  
  /**
   * Stops memory tracking interval
   */
  private stopMemoryTracking(): void {
    if (this.memoryStatsInterval) {
      clearInterval(this.memoryStatsInterval);
      this.memoryStatsInterval = null;
      logger.debug('Memory usage tracking stopped');
    }
  }
  
  /**
   * Updates cache memory usage statistics
   */
  private async updateMemoryStats(): Promise<void> {
    try {
      if (!this.redisAvailable) {
        // Just update local cache stats if Redis is down
        this.updateLocalCacheStats();
        return;
      }
      
      await this.updateRedisMemoryStats();
      this.updateLocalCacheStats();
      
      // Emit memory pressure events based on thresholds
      const criticalThreshold = this.memoryOptions.memoryCriticalThreshold || 95;
      const warningThreshold = this.memoryOptions.memoryWarningThreshold || 80;
      
      if (this.memoryStats.usagePercentage >= criticalThreshold) {
        this.emit('redis:memory_critical', this.memoryStats);
        logger.warn(`Redis memory usage critical: ${this.memoryStats.usagePercentage.toFixed(2)}%`, {
          used_mb: Math.round(this.memoryStats.totalBytes / 1024 / 1024),
          max_mb: this.memoryOptions.redisMaxMemoryMB || 100
        });
        
        // Attempt to free memory
        this.enforceMemoryLimits().catch(err => {
          logger.error('Failed to enforce memory limits', { error: err.message });
        });
        
      } else if (this.memoryStats.usagePercentage >= warningThreshold) {
        this.emit('redis:memory_warning', this.memoryStats);
        logger.warn(`Redis memory usage warning: ${this.memoryStats.usagePercentage.toFixed(2)}%`, {
          used_mb: Math.round(this.memoryStats.totalBytes / 1024 / 1024),
          max_mb: this.memoryOptions.redisMaxMemoryMB || 100
        });
      }
    } catch (error: any) {
      logger.error('Failed to update cache memory stats', { error: error.message });
    }
  }
  
  /**
   * Updates Redis memory statistics
   */
  private async updateRedisMemoryStats(): Promise<void> {
    if (!this.redisAvailable || !this.redis) {
      return;
    }
    
    try {
      // Get Redis memory usage info
      const info = await this.redis.info('memory');
      if (!info) return;
      
      const usedMemoryMatch = /used_memory:(\d+)/.exec(info);
      const usedMemoryRssMatch = /used_memory_rss:(\d+)/.exec(info);
      const memFragRatioMatch = /mem_fragmentation_ratio:([\d\.]+)/.exec(info);
      const maxMemoryMatch = /maxmemory:(\d+)/.exec(info);
      const usedMemoryPeakMatch = /used_memory_peak:(\d+)/.exec(info);
      
      if (usedMemoryMatch) {
        const usedMemory = parseInt(usedMemoryMatch[1], 10);
        const usedMemoryRss = usedMemoryRssMatch ? parseInt(usedMemoryRssMatch[1], 10) : usedMemory;
        const memFragRatio = memFragRatioMatch ? parseFloat(memFragRatioMatch[1]) : 1;
        
        // Get configured max memory - either from Redis config or our options
        // Default to 100MB if not set
        const redisMaxMemoryMB = this.memoryOptions.redisMaxMemoryMB || 100;
        let maxMemoryBytes = redisMaxMemoryMB * 1024 * 1024;
        if (maxMemoryMatch && parseInt(maxMemoryMatch[1], 10) > 0) {
          maxMemoryBytes = parseInt(maxMemoryMatch[1], 10);
        }
        
        // Get peak memory usage if available
        let peakBytes = this.memoryStats.peakBytes;
        if (usedMemoryPeakMatch) {
          peakBytes = parseInt(usedMemoryPeakMatch[1], 10);
        } else {
          // If Redis doesn't report peak, track it ourselves
          peakBytes = Math.max(peakBytes, usedMemory);
        }
        
        // Update memory stats
        this.memoryStats.totalBytes = usedMemory;
        this.memoryStats.rssBytes = usedMemoryRss;
        this.memoryStats.fragmentationRatio = memFragRatio;
        this.memoryStats.peakBytes = peakBytes;
        this.memoryStats.maxMemoryBytes = maxMemoryBytes;
        
        // Calculate percentage of max memory used
        this.memoryStats.usagePercentage = (usedMemory / maxMemoryBytes) * 100;
        this.memoryStats.limitReached = this.memoryStats.usagePercentage >= 100;
        
        // Get key count
        const keyCount = await this.redis.dbsize();
        this.memoryStats.keysCount = keyCount;
        
        // Calculate average sizes if we have keys
        if (keyCount > 0) {
          this.memoryStats.avgKeySize = Math.floor(usedMemory / keyCount);
        }
        
        // Record memory metrics
        this.metricsCollector.observeGauge('redis_memory_usage_bytes', {}, usedMemory);
        this.metricsCollector.observeGauge('redis_memory_fragmentation_ratio', {}, memFragRatio);
        this.metricsCollector.observeGauge('redis_memory_peak_bytes', {}, peakBytes);
        this.metricsCollector.observeGauge('redis_memory_limit_bytes', {}, maxMemoryBytes);
        this.metricsCollector.observeGauge('redis_memory_usage_percentage', {}, this.memoryStats.usagePercentage);
        this.metricsCollector.observeGauge('redis_keys_total', {}, keyCount);
        
        // Track key size distribution if enabled
        if (this.memoryOptions.trackKeySizeDistribution) {
          await this.trackKeySizeDistribution();
        }
      }
    } catch (error: any) {
      logger.error('Failed to update Redis memory stats', { error: error.message });
    }
  }
  
  /**
   * Updates local cache memory statistics
   */
  private updateLocalCacheStats(): void {
    const stats = this.localCache.getStats();
    const memoryOpts = this.localCache.options;
    
    // Track local cache metrics
    this.metricsCollector.observeGauge('local_cache_keys', {}, stats.keys);
    this.metricsCollector.observeGauge('local_cache_hits', {}, stats.hits);
    this.metricsCollector.observeGauge('local_cache_misses', {}, stats.misses);
    
    // Calculate usage percentage
    const usagePercent = memoryOpts.maxKeys ? (stats.keys / memoryOpts.maxKeys) * 100 : 0;
    
    // Log if usage is high
    const warningThreshold = this.memoryOptions.memoryWarningThreshold || 80;
    if (usagePercent >= warningThreshold) {
      logger.info('Local cache usage high', {
        keysCount: stats.keys,
        maxKeys: memoryOpts.maxKeys,
        usagePercent: usagePercent.toFixed(2),
        hitRate: stats.hits > 0 ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(2) + '%' : '0%'
      });
      
      // Emit local cache warning
      this.emit('localCache:memory_warning', { usagePercent, stats });
    }
  }
  
  /**
   * Enforces memory limits by evicting keys based on policy
   */
  private async enforceMemoryLimits(): Promise<void> {
    try {
      // If we're over the critical threshold, evict some keys
      const evictionPolicy = this.memoryOptions.redisEvictionPolicy || CacheEvictionPolicy.LRU;
      const warningThreshold = this.memoryOptions.memoryWarningThreshold || 80;
      
      // Determine how many keys to evict (aim to get below warning threshold)
      const targetReduction = this.memoryStats.usagePercentage - warningThreshold;
      const keyCountToEvict = Math.ceil(this.memoryStats.keysCount * (targetReduction / 100));
      
      // Set a reasonable limit
      const safeEvictionLimit = Math.min(keyCountToEvict, 100); 
      
      logger.info('Enforcing memory limits', {
        evictionPolicy,
        keysToEvict: safeEvictionLimit,
        currentUsage: this.memoryStats.usagePercentage.toFixed(2) + '%'
      });
      
      if (evictionPolicy === CacheEvictionPolicy.LRU) {
        // For LRU, we can use Redis's own LRU capabilities
        // This is just a hint to Redis to start evicting
        await this.redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
      } else if (evictionPolicy === CacheEvictionPolicy.RANDOM) {
        // Random eviction - get random keys and delete them
        const keys = await this.getRandomKeys(safeEvictionLimit);
        if (keys.length > 0) {
          // Use pipeline for bulk deletes
          const pipeline = this.redis.pipeline();
          for (const key of keys) {
            pipeline.del(key);
          }
          
          const results = await pipeline.exec();
          const deletedCount = results ? results.filter(r => r[0] === null && r[1] === 1).length : 0;
          
          logger.info(`Evicted ${deletedCount} keys randomly`);
          
          // Track eviction in metrics
          this.metricsCollector.incrementCounter('cache_key_evictions_total', {
            policy: evictionPolicy,
            count: String(deletedCount)
          });
        }
      } else if (evictionPolicy === CacheEvictionPolicy.TTL) {
        // TTL-based eviction - delete keys closest to expiry
        // This requires scanning keys and checking TTL
        const expiringKeys = await this.getKeysWithLowestTTL(safeEvictionLimit);
        if (expiringKeys.length > 0) {
          // Use pipeline for bulk deletes
          const pipeline = this.redis.pipeline();
          for (const key of expiringKeys) {
            pipeline.del(key);
          }
          
          const results = await pipeline.exec();
          const deletedCount = results ? results.filter(r => r[0] === null && r[1] === 1).length : 0;
          
          logger.info(`Evicted ${deletedCount} keys with lowest TTL`);
          
          // Track eviction in metrics
          this.metricsCollector.incrementCounter('cache_key_evictions_total', {
            policy: evictionPolicy,
            count: String(deletedCount)
          });
        }
      }
      
      // For other policies, rely on Redis's built-in eviction
    } catch (error: any) {
      logger.error('Failed to enforce memory limits', { error: error.message });
    }
  }
  
  /**
   * Track the size distribution of keys by prefix
   */
  private async trackKeySizeDistribution(): Promise<void> {
    try {
      // Reset the distribution map
      this.keySizeDistribution.clear();
      
      // Sample keys to determine size distribution
      const sampleSize = Math.min(this.memoryStats.keysCount, 100); // Limit sample size
      const keys = await this.getRandomKeys(sampleSize);
      
      for (const key of keys) {
        // Get the prefix (everything before the first colon)
        const prefixMatch = key.match(/^([^:]+):/); 
        const prefix = prefixMatch ? prefixMatch[1] : 'other';
        
        // Get memory usage of this key
        const size = await this.redis.memory('USAGE', key);
        
        // Add to our distribution map if size is not null
        if (size !== null && size !== undefined) {
          this.keySizeDistribution.set(
            prefix, 
            (this.keySizeDistribution.get(prefix) || 0) + size
          );
        }
      }
      
      // Log the distribution
      const distribution = Array.from(this.keySizeDistribution.entries());
      distribution.sort((a, b) => b[1] - a[1]); // Sort by size descending
      
      const totalBytes = distribution.reduce((sum, [, size]) => sum + size, 0);
      
      // Log top consumers
      if (distribution.length > 0) {
        const topConsumers = distribution.slice(0, 5); // Top 5 consumers
        
        logger.debug('Cache memory distribution by prefix', {
          totalSampleBytes: totalBytes,
          sampleSize,
          topConsumers: topConsumers.map(([prefix, bytes]) => ({
            prefix,
            sizeKB: (bytes / 1024).toFixed(2),
            percentage: ((bytes / totalBytes) * 100).toFixed(2) + '%'
          }))
        });
        
        // Record metrics for top consumers
        topConsumers.forEach(([prefix, bytes]) => {
          this.metricsCollector.observeGauge('cache_prefix_memory_bytes', {
            prefix
          }, bytes);
        });
      }
    } catch (error: any) {
      logger.debug('Failed to track key size distribution', { error: error.message });
    }
  }
  
  /**
   * Gets a sample of random keys from Redis
   * 
   * @param count - Number of keys to sample
   * @returns Array of random keys
   */
  private async getRandomKeys(count: number): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';
    
    // Use SCAN to get keys in batches
    do {
      const [nextCursor, batch] = await this.redis.scan(
        cursor, 
        'COUNT', 
        Math.min(count, 100)
      ) as [string, string[]];
      
      cursor = nextCursor;
      keys.push(...batch);
      
      if (keys.length >= count || cursor === '0') {
        break;
      }
    } while (true);
    
    // Shuffle and limit to requested count
    return keys
      .sort(() => Math.random() - 0.5) // Simple shuffle
      .slice(0, count);
  }
  
  /**
   * Gets keys with the lowest TTL (closest to expiry)
   * 
   * @param count - Number of keys to find
   * @returns Array of keys with lowest TTL
   */
  private async getKeysWithLowestTTL(count: number): Promise<string[]> {
    // Get a sample of keys first
    const sampleKeys = await this.getRandomKeys(count * 3); // Sample more keys for better selection
    const keysWithTTL: Array<{ key: string, ttl: number }> = [];
    
    // Get TTL for each key
    for (const key of sampleKeys) {
      const ttl = await this.redis.ttl(key);
      
      // Only include keys with a valid TTL (not -1 or -2)
      if (ttl > 0) {
        keysWithTTL.push({ key, ttl });
      }
    }
    
    // Sort by TTL (ascending) and take the first 'count' keys
    return keysWithTTL
      .sort((a, b) => a.ttl - b.ttl)
      .slice(0, count)
      .map(item => item.key);
  }
  
  /**
   * Gets cache statistics including memory usage
   * 
   * @returns Cache statistics including keys count, memory usage, etc.
   */
  public async getStats(): Promise<Record<string, any>> {
    try {
      // Make sure memory stats are up-to-date
      await this.updateMemoryStats();
      
      // Fix TypeScript error with info() method
      const sections = ['server', 'clients', 'memory', 'stats'];
      const infoPromises = sections.map(section => this.redis.info(section));
      const infoResults = await Promise.all(infoPromises);
      const info = infoResults.join('\n');
      const stats: Record<string, any> = {};
      
      // Parse INFO response
      info.split('\n').forEach((line) => {
        const parts = line.split(':');
        if (parts.length === 2) {
          const key = parts[0].trim();
          const value = parts[1].trim();
          stats[key] = isNaN(Number(value)) ? value : Number(value);
        }
      });
      
      // Add our memory stats
      stats.memoryStats = { 
        ...this.memoryStats,
        totalMB: this.memoryStats.totalBytes / (1024 * 1024),
        peakMB: this.memoryStats.peakBytes / (1024 * 1024)
      };
      
      // Add local cache stats
      stats.localCache = this.localCache.getStats();
      
      // Add memory limits info
      stats.memoryLimits = {
        redisMaxMemoryMB: this.memoryOptions.redisMaxMemoryMB,
        localMaxItems: this.memoryOptions.localMaxItems,
        warningThresholdPercent: this.memoryOptions.memoryWarningThreshold,
        criticalThresholdPercent: this.memoryOptions.memoryCriticalThreshold,
        evictionPolicy: this.memoryOptions.redisEvictionPolicy
      };
      
      return stats;
    } catch (error: any) {
      logger.error('Failed to get cache stats', { error: error.message });
      return { error: error.message, memoryStats: this.memoryStats };
    }
  }

  /**
   * Closes Redis connection cleanly
   */
  public async close(): Promise<void> {
    try {
      // Stop health check interval
      this.stopHealthCheck();
      
      // Stop memory tracking
      this.stopMemoryTracking();
      
      // Clear any pending reconnect attempts
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      // Close Redis connection
      await this.redis.quit();
      logger.info('Redis connection closed');
    } catch (error: any) {
      logger.error('Error closing Redis connection', { error: error.message });
    }
  }
}
