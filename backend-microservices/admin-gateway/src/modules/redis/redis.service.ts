import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;
  private subscriber: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      // Initialize Redis connections
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      this.subscriber = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });

      // Connect to Redis
      await this.redis.connect();
      await this.subscriber.connect();

      this.logger.log('Successfully connected to Redis');

      // Set up error handlers
      this.redis.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.subscriber.on('error', (error) => {
        this.logger.error('Redis subscriber error:', error);
      });

    } catch (error) {
      this.logger.warn('Redis connection failed, running without Redis:', error.message);
      // Don't throw error, just log warning - service can run without Redis
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.disconnect();
    }
    if (this.subscriber) {
      await this.subscriber.disconnect();
    }
  }

  // Optional cache methods (graceful degradation if Redis not available)
  async get(key: string): Promise<string | null> {
    try {
      if (!this.redis) return null;
      return await this.redis.get(key);
    } catch (error) {
      this.logger.warn(`Redis GET failed for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!this.redis) return false;
      
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.warn(`Redis SET failed for key ${key}:`, error.message);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.redis) return false;
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.warn(`Redis DEL failed for key ${key}:`, error.message);
      return false;
    }
  }

  // Optional pub/sub methods (graceful degradation if Redis not available)
  async publish(channel: string, message: string): Promise<boolean> {
    try {
      if (!this.redis) return false;
      await this.redis.publish(channel, message);
      return true;
    } catch (error) {
      this.logger.warn(`Redis PUBLISH failed for channel ${channel}:`, error.message);
      return false;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<boolean> {
    try {
      if (!this.subscriber) return false;
      
      this.subscriber.subscribe(channel);
      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message);
        }
      });
      
      return true;
    } catch (error) {
      this.logger.warn(`Redis SUBSCRIBE failed for channel ${channel}:`, error.message);
      return false;
    }
  }

  // Session cache methods (optional)
  async cacheAdminSession(adminId: string, sessionData: any, ttl: number = 3600): Promise<boolean> {
    return this.set(`admin_session:${adminId}`, JSON.stringify(sessionData), ttl);
  }

  async getAdminSession(adminId: string): Promise<any | null> {
    try {
      const data = await this.get(`admin_session:${adminId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.warn(`Failed to parse session data for admin ${adminId}:`, error.message);
      return null;
    }
  }

  async invalidateAdminSession(adminId: string): Promise<boolean> {
    return this.del(`admin_session:${adminId}`);
  }

  // Optional: API rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    try {
      if (!this.redis) return true; // Allow if Redis not available
      
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      
      return current <= limit;
    } catch (error) {
      this.logger.warn(`Rate limit check failed for key ${key}:`, error.message);
      return true; // Allow if Redis fails
    }
  }
}