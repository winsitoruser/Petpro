import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = new Redis({
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        maxRetriesPerRequest: 3,
        
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis client error:', error);
      });

      await this.client.connect();
      this.logger.log('Redis service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      this.logger.log('Redis client disconnected');
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // Cache operations
  async set(key: string, value: any, ttl?: number): Promise<string> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttl) {
      return this.client.setex(key, ttl, stringValue);
    }
    return this.client.set(key, stringValue);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  // Service registry operations
  async registerService(serviceName: string, serviceInfo: any): Promise<void> {
    const key = `service:${serviceName}`;
    await this.set(key, serviceInfo, 60); // 60 seconds TTL for service registration
    this.logger.log(`Service registered: ${serviceName}`);
  }

  async getService(serviceName: string): Promise<any> {
    const key = `service:${serviceName}`;
    return this.get(key);
  }

  async getAllServices(): Promise<any[]> {
    const serviceKeys = await this.keys('service:*');
    const services = [];
    
    for (const key of serviceKeys) {
      const service = await this.get(key);
      if (service) {
        services.push({
          name: key.replace('service:', ''),
          ...service
        });
      }
    }
    
    return services;
  }

  // Gateway cache operations
  async cacheResponse(key: string, response: any, ttl: number = 300): Promise<void> {
    await this.set(`cache:${key}`, response, ttl);
  }

  async getCachedResponse(key: string): Promise<any> {
    return this.get(`cache:${key}`);
  }

  // Rate limiting
  async incrementCounter(key: string, ttl: number = 60): Promise<number> {
    const multi = this.client.multi();
    multi.incr(key);
    multi.expire(key, ttl);
    const results = await multi.exec();
    return results[0][1] as number;
  }
}