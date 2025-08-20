import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface ServiceMessage {
  type: string;
  service: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
}

@Injectable()
export class RedisPubSubService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisPubSubService.name);
  private publisher: Redis;
  private subscriber: Redis;
  private readonly messageHandlers = new Map<string, Function[]>();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      const redisConfig = {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD'),
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true,
      };

      this.publisher = new Redis(redisConfig);
      this.subscriber = new Redis(redisConfig);

      this.subscriber.on('message', (channel, message) => {
        this.handleMessage(channel, message);
      });

      await Promise.all([
        this.publisher.connect(),
        this.subscriber.connect()
      ]);

      this.logger.log('Redis Pub/Sub service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis Pub/Sub:', error);
    }
  }

  async onModuleDestroy() {
    if (this.publisher) {
      await this.publisher.disconnect();
    }
    if (this.subscriber) {
      await this.subscriber.disconnect();
    }
    this.logger.log('Redis Pub/Sub clients disconnected');
  }

  // Publish message to a channel
  async publish(channel: string, message: ServiceMessage): Promise<void> {
    try {
      const messageString = JSON.stringify({
        ...message,
        timestamp: new Date(),
      });
      
      await this.publisher.publish(channel, messageString);
      this.logger.debug(`Published message to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to publish message to channel ${channel}:`, error);
    }
  }

  // Subscribe to a channel
  async subscribe(channel: string, handler: (message: ServiceMessage) => void): Promise<void> {
    try {
      if (!this.messageHandlers.has(channel)) {
        this.messageHandlers.set(channel, []);
        await this.subscriber.subscribe(channel);
        this.logger.log(`Subscribed to channel: ${channel}`);
      }
      
      this.messageHandlers.get(channel)!.push(handler);
    } catch (error) {
      this.logger.error(`Failed to subscribe to channel ${channel}:`, error);
    }
  }

  // Unsubscribe from a channel
  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
      this.messageHandlers.delete(channel);
      this.logger.log(`Unsubscribed from channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from channel ${channel}:`, error);
    }
  }

  // Handle incoming messages
  private handleMessage(channel: string, message: string): void {
    try {
      const parsedMessage: ServiceMessage = JSON.parse(message);
      const handlers = this.messageHandlers.get(channel);
      
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(parsedMessage);
          } catch (error) {
            this.logger.error(`Error in message handler for channel ${channel}:`, error);
          }
        });
      }
    } catch (error) {
      this.logger.error(`Failed to parse message from channel ${channel}:`, error);
    }
  }

  // Convenience methods for common patterns
  async publishUserEvent(event: string, userId: string, data: any): Promise<void> {
    await this.publish('user-events', {
      type: event,
      service: 'auth-service',
      data: { userId, ...data }
    } as ServiceMessage);
  }

  async publishServiceEvent(event: string, service: string, data: any): Promise<void> {
    await this.publish('service-events', {
      type: event,
      service,
      data
    } as ServiceMessage);
  }

  // Request-Response pattern using Redis
  async request(channel: string, data: any, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const correlationId = `req_${Date.now()}_${Math.random()}`;
      const responseChannel = `${channel}_response_${correlationId}`;
      
      const timeoutId = setTimeout(() => {
        this.unsubscribe(responseChannel);
        reject(new Error('Request timeout'));
      }, timeout);

      this.subscribe(responseChannel, (message) => {
        if (message.correlationId === correlationId) {
          clearTimeout(timeoutId);
          this.unsubscribe(responseChannel);
          resolve(message.data);
        }
      });

      this.publish(channel, {
        type: 'request',
        service: 'auth-service',
        data,
        correlationId
      } as ServiceMessage);
    });
  }

  async respond(channel: string, correlationId: string, data: any): Promise<void> {
    const responseChannel = `${channel}_response_${correlationId}`;
    await this.publish(responseChannel, {
      type: 'response',
      service: 'auth-service',
      data,
      correlationId
    } as ServiceMessage);
  }
}