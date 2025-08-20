import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisPubSubService } from '../redis/redis-pubsub.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly pubSubService: RedisPubSubService,
  ) {}

  async onModuleInit() {
    this.logger.log('Events service initialized with Redis pub/sub');
  }

  /**
   * Publish a user created event
   * @param userData User data to publish
   */
  async publishUserCreated(userData: any): Promise<void> {
    try {
      const { password, ...userDataWithoutPassword } = userData;
      
      await this.pubSubService.publish('user.created', {
        type: 'user.created',
        service: 'auth-service',
        data: {
          id: userDataWithoutPassword.id,
          email: userDataWithoutPassword.email,
          firstName: userDataWithoutPassword.firstName,
          lastName: userDataWithoutPassword.lastName,
          role: userDataWithoutPassword.role,
          createdAt: new Date().toISOString(),
          eventId: this.generateEventId(),
        },
        timestamp: new Date(),
      });
      
      this.logger.log(`Published user.created event for user: ${userData.id}`);
    } catch (error) {
      this.logger.error('Failed to publish user.created event', error);
    }
  }

  /**
   * Publish a user login event
   * @param userId User ID
   * @param metadata Login metadata
   */
  async publishUserLogin(userId: string, metadata: any): Promise<void> {
    try {
      await this.pubSubService.publish('user.login', {
        type: 'user.login',
        service: 'auth-service',
        data: {
          userId,
          timestamp: new Date().toISOString(),
          ipAddress: metadata.ipAddress,
          userAgent: metadata.userAgent,
          eventId: this.generateEventId(),
        },
        timestamp: new Date(),
      });
      
      this.logger.log(`Published user.login event for user: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to publish user.login event', error);
    }
  }

  /**
   * Publish a user updated event
   * @param userData Updated user data
   */
  async publishUserUpdated(userData: any): Promise<void> {
    try {
      const { password, ...userDataWithoutPassword } = userData;
      
      await this.pubSubService.publish('user.updated', {
        type: 'user.updated',
        service: 'auth-service',
        data: {
          id: userDataWithoutPassword.id,
          email: userDataWithoutPassword.email,
          firstName: userDataWithoutPassword.firstName,
          lastName: userDataWithoutPassword.lastName,
          role: userDataWithoutPassword.role,
          updatedAt: new Date().toISOString(),
          eventId: this.generateEventId(),
        },
        timestamp: new Date(),
      });
      
      this.logger.log(`Published user.updated event for user: ${userData.id}`);
    } catch (error) {
      this.logger.error('Failed to publish user.updated event', error);
    }
  }

  /**
   * Publish a password reset requested event
   * @param userId User ID
   */
  async publishPasswordResetRequested(userId: string): Promise<void> {
    try {
      await this.pubSubService.publish('user.password.reset.requested', {
        type: 'user.password.reset.requested',
        service: 'auth-service',
        data: {
          userId,
          timestamp: new Date().toISOString(),
          eventId: this.generateEventId(),
        },
        timestamp: new Date(),
      });
      
      this.logger.log(`Published password reset requested event for user: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to publish password reset requested event', error);
    }
  }

  /**
   * Publish a user deleted event
   * @param userId User ID
   */
  async publishUserDeleted(userId: string): Promise<void> {
    try {
      await this.pubSubService.publish('user.deleted', {
        type: 'user.deleted',
        service: 'auth-service',
        data: {
          userId,
          deletedAt: new Date().toISOString(),
          eventId: this.generateEventId(),
        },
        timestamp: new Date(),
      });
      
      this.logger.log(`Published user.deleted event for user: ${userId}`);
    } catch (error) {
      this.logger.error('Failed to publish user.deleted event', error);
    }
  }

  /**
   * Generate a unique event ID
   * @returns Unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}