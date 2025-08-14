/**
 * Redis Cache Manager
 * 
 * Manages Redis connections, cache operations, and invalidation patterns
 * for the enhanced repository pattern.
 */
import Redis, { Redis as RedisClient, RedisOptions } from 'ioredis';
import { logger } from '../utils/logger';

export interface CacheOptions {
  host?: string;
  port?: number;
  password?: string;
  ttl?: number;
  keyPrefix?: string;
  connectionTimeout?: number;
  maxRetriesPerRequest?: number;
  enableOfflineQueue?: boolean;
  enableReadyCheck?: boolean;
}

export class CacheManager {
  private static instance: CacheManager;
  private client: RedisClient | null = null;
  private isConnected = false;
  private defaultTtl: number;
  private keyPrefix: string;

  private constructor(options: CacheOptions = {}) {
    const {
      host = process.env.REDIS_HOST || 'localhost',
      port = parseInt(process.env.REDIS_PORT || '6379', 10),
      password = process.env.REDIS_PASSWORD,
      ttl = parseInt(process.env.REDIS_DEFAULT_TTL || '300', 10),
      keyPrefix = process.env.REDIS_KEY_PREFIX || 'petpro:',
      connectionTimeout = parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '5000', 10),
      maxRetriesPerRequest = parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
      enableOfflineQueue = process.env.REDIS_ENABLE_OFFLINE_QUEUE !== 'false',
      enableReadyCheck = true
    } = options;

    this.defaultTtl = ttl;
    this.keyPrefix = keyPrefix;

    // Configure Redis client options
    const redisOptions: RedisOptions = {
      host,
      port,
      password: password || undefined,
      keyPrefix,
      connectionTimeout,
      maxRetriesPerRequest,
      enableOfflineQueue,
      enableReadyCheck,
      retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      reconnectOnError: (err) => {
        // Only reconnect on specific errors
        const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNREFUSED'];
        return targetErrors.some(e => err.message.includes(e));
      }
    };

    try {
      this.client = new Redis(redisOptions);
      
      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('Redis client connected');
      });
      
      this.client.on('error', (err) => {
        logger.error('Redis client error', { error: err.message });
      });
      
      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis client connection closed');
      });
      
      this.client.on('reconnecting', () => {
        logger.info('Redis client reconnecting');
      });
      
      process.on('SIGINT', () => this.close());
      process.on('SIGTERM', () => this.close());
    } catch (error) {
      logger.error('Redis client initialization error', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      this.client = null;
    }
  }

  /**
   * Get the CacheManager instance (Singleton)
   */
  public static getInstance(options?: CacheOptions): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(options);
    }
    return CacheManager.instance;
  }

  /**
   * Check if the cache is connected and available
   */
  public isAvailable(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Get a value from cache
   */
  public async get<T = any>(key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const value = await this.client!.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis get error', { 
        error: error instanceof Error ? error.message : String(error),
        key
      });
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  public async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const effectiveTtl = ttlSeconds || this.defaultTtl;
      
      if (effectiveTtl > 0) {
        await this.client!.set(key, serializedValue, 'EX', effectiveTtl);
      } else {
        await this.client!.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      logger.error('Redis set error', { 
        error: error instanceof Error ? error.message : String(error),
        key
      });
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  public async del(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      await this.client!.del(key);
      return true;
    } catch (error) {
      logger.error('Redis del error', { 
        error: error instanceof Error ? error.message : String(error),
        key
      });
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   */
  public async delMany(keys: string[]): Promise<boolean> {
    if (!this.isAvailable() || keys.length === 0) {
      return false;
    }

    try {
      await this.client!.del(keys);
      return true;
    } catch (error) {
      logger.error('Redis delMany error', { 
        error: error instanceof Error ? error.message : String(error),
        keys
      });
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  public async delByPattern(pattern: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Find keys matching pattern
      const stream = this.client!.scanStream({
        match: pattern,
        count: 100
      });
      
      const pipeline = this.client!.pipeline();
      let keyCount = 0;
      
      return new Promise((resolve, reject) => {
        stream.on('data', (keys: string[]) => {
          if (keys.length) {
            keyCount += keys.length;
            pipeline.del(...keys);
          }
        });
        
        stream.on('end', async () => {
          if (keyCount > 0) {
            try {
              await pipeline.exec();
              logger.info(`Deleted ${keyCount} keys matching pattern: ${pattern}`);
              resolve(true);
            } catch (error) {
              logger.error('Redis pattern deletion error during pipeline execution', { 
                error: error instanceof Error ? error.message : String(error),
                pattern
              });
              reject(error);
            }
          } else {
            resolve(false);
          }
        });
        
        stream.on('error', (err) => {
          logger.error('Redis pattern deletion error', { 
            error: err.message,
            pattern
          });
          reject(err);
        });
      });
    } catch (error) {
      logger.error('Redis delByPattern error', { 
        error: error instanceof Error ? error.message : String(error),
        pattern
      });
      return false;
    }
  }

  /**
   * Get or set cache value with factory function
   */
  public async getOrSet<T = any>(
    key: string, 
    factory: () => Promise<T>, 
    ttlSeconds?: number
  ): Promise<T> {
    const cachedValue = await this.get<T>(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /**
   * Check if key exists in cache
   */
  public async exists(key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error', { 
        error: error instanceof Error ? error.message : String(error),
        key
      });
      return false;
    }
  }

  /**
   * Set key expiration
   */
  public async expire(key: string, ttlSeconds: number): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const result = await this.client!.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      logger.error('Redis expire error', { 
        error: error instanceof Error ? error.message : String(error),
        key,
        ttlSeconds
      });
      return false;
    }
  }

  /**
   * Increment a counter in cache
   */
  public async increment(key: string, amount = 1): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      if (amount === 1) {
        return await this.client!.incr(key);
      } else {
        return await this.client!.incrby(key, amount);
      }
    } catch (error) {
      logger.error('Redis increment error', { 
        error: error instanceof Error ? error.message : String(error),
        key,
        amount
      });
      return 0;
    }
  }

  /**
   * Decrement a counter in cache
   */
  public async decrement(key: string, amount = 1): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      if (amount === 1) {
        return await this.client!.decr(key);
      } else {
        return await this.client!.decrby(key, amount);
      }
    } catch (error) {
      logger.error('Redis decrement error', { 
        error: error instanceof Error ? error.message : String(error),
        key,
        amount
      });
      return 0;
    }
  }

  /**
   * Add value to a set
   */
  public async addToSet(key: string, ...values: string[]): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      return await this.client!.sadd(key, ...values);
    } catch (error) {
      logger.error('Redis addToSet error', { 
        error: error instanceof Error ? error.message : String(error),
        key
      });
      return 0;
    }
  }

  /**
   * Remove value from a set
   */
  public async removeFromSet(key: string, ...values: string[]): Promise<number> {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      return await this.client!.srem(key, ...values);
    } catch (error) {
      logger.error('Redis removeFromSet error', { 
        error: error instanceof Error ? error.message : String(error),
        key
      });
      return 0;
    }
  }

  /**
   * Check if value is in a set
   */
  public async isInSet(key: string, value: string): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      return await this.client!.sismember(key, value) === 1;
    } catch (error) {
      logger.error('Redis isInSet error', { 
        error: error instanceof Error ? error.message : String(error),
        key,
        value
      });
      return false;
    }
  }

  /**
   * Get all members of a set
   */
  public async getSetMembers(key: string): Promise<string[]> {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      return await this.client!.smembers(key);
    } catch (error) {
      logger.error('Redis getSetMembers error', { 
        error: error instanceof Error ? error.message : String(error),
        key
      });
      return [];
    }
  }

  /**
   * Run health check
   */
  public async healthCheck(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const pong = await this.client!.ping();
      return pong === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Close the Redis connection gracefully
   */
  public async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
        this.isConnected = false;
        logger.info('Redis connection closed gracefully');
      } catch (error) {
        logger.error('Error closing Redis connection', { 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }
  }
}

// Export a default singleton instance
export const cacheManager = CacheManager.getInstance();

export default cacheManager;
