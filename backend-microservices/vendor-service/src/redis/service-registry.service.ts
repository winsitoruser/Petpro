import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisPubSubService } from './redis-pubsub.service';

@Injectable()
export class ServiceRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private readonly serviceName = 'auth-service';
  private registrationInterval: NodeJS.Timeout;

  constructor(
    private readonly redisService: RedisService,
    private readonly pubSubService: RedisPubSubService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.registerService();
    
    // Re-register every 30 seconds to maintain TTL
    this.registrationInterval = setInterval(() => {
      this.registerService();
    }, 30000);

    // Announce service startup
    await this.pubSubService.publishServiceEvent('service.started', this.serviceName, {
      serviceName: this.serviceName,
      url: this.getServiceUrl(),
      timestamp: new Date(),
    });
  }

  async onModuleDestroy() {
    if (this.registrationInterval) {
      clearInterval(this.registrationInterval);
    }

    // Announce service shutdown
    await this.pubSubService.publishServiceEvent('service.stopped', this.serviceName, {
      serviceName: this.serviceName,
      timestamp: new Date(),
    });

    // Remove service registration
    await this.redisService.del(`service:${this.serviceName}`);
  }

  private async registerService(): Promise<void> {
    try {
      const serviceInfo = {
        name: this.serviceName,
        url: this.getServiceUrl(),
        status: 'healthy',
        version: '1.0.0',
        capabilities: [
          'authentication',
          'user-management',
          'jwt-tokens',
          'password-reset',
          'user-profiles'
        ],
        endpoints: {
          health: '/api/v1/health',
          docs: '/api/v1/docs',
          auth: {
            login: '/api/v1/auth/login',
            register: '/api/v1/auth/register',
            refresh: '/api/v1/auth/refresh-token',
            me: '/api/v1/auth/me',
          },
          users: {
            list: '/api/v1/users',
            get: '/api/v1/users/:id',
            update: '/api/v1/users/:id',
            search: '/api/v1/users/search',
          },
          internal: {
            getUser: '/api/v1/api/internal/users/:id',
            bulkUsers: '/api/v1/api/internal/users/bulk',
          }
        },
        lastHeartbeat: new Date(),
      };

      await this.redisService.registerService(this.serviceName, serviceInfo);
      this.logger.debug(`Service registered: ${this.serviceName}`);
    } catch (error) {
      this.logger.error(`Failed to register service: ${error.message}`);
    }
  }

  private getServiceUrl(): string {
    const port = this.configService.get<number>('PORT', 3001);
    const host = this.configService.get<string>('HOST', 'localhost');
    return `http://${host}:${port}`;
  }

  // Method to update service status
  async updateServiceStatus(status: 'healthy' | 'unhealthy' | 'degraded'): Promise<void> {
    try {
      const currentService = await this.redisService.getService(this.serviceName);
      if (currentService) {
        currentService.status = status;
        currentService.lastHeartbeat = new Date();
        await this.redisService.registerService(this.serviceName, currentService);
        
        // Publish status change event
        await this.pubSubService.publishServiceEvent('service.status.changed', this.serviceName, {
          serviceName: this.serviceName,
          status,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(`Failed to update service status: ${error.message}`);
    }
  }
}