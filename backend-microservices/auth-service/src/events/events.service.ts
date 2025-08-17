import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    // List of topics this service will subscribe to
    const topics = [
      'user.profile.update',
      'user.permissions.update',
      'system.maintenance'
    ];

    // Subscribe to topics
    topics.forEach(topic => {
      this.kafkaClient.subscribeToResponseOf(topic);
      this.logger.log(`Subscribed to topic: ${topic}`, 'EventsService');
    });

    try {
      await this.kafkaClient.connect();
      this.logger.log('Connected to Kafka broker', 'EventsService');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka broker', error, 'EventsService');
    }
  }

  /**
   * Publish a user created event
   * @param userData User data to publish
   */
  async publishUserCreated(userData: any): Promise<void> {
    try {
      const { password, ...userDataWithoutPassword } = userData;
      
      await this.kafkaClient.emit('user.created', {
        id: userDataWithoutPassword.id,
        email: userDataWithoutPassword.email,
        firstName: userDataWithoutPassword.firstName,
        lastName: userDataWithoutPassword.lastName,
        role: userDataWithoutPassword.role,
        createdAt: new Date().toISOString(),
        eventId: this.generateEventId(),
      });
      
      this.logger.log(`Published user.created event for user: ${userData.id}`, 'EventsService');
    } catch (error) {
      this.logger.error('Failed to publish user.created event', error, 'EventsService');
    }
  }

  /**
   * Publish a user login event
   * @param userId User ID
   * @param metadata Login metadata
   */
  async publishUserLogin(userId: string, metadata: any): Promise<void> {
    try {
      await this.kafkaClient.emit('user.login', {
        userId,
        timestamp: new Date().toISOString(),
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        eventId: this.generateEventId(),
      });
      
      this.logger.log(`Published user.login event for user: ${userId}`, 'EventsService');
    } catch (error) {
      this.logger.error('Failed to publish user.login event', error, 'EventsService');
    }
  }

  /**
   * Publish a user updated event
   * @param userData Updated user data
   */
  async publishUserUpdated(userData: any): Promise<void> {
    try {
      const { password, ...userDataWithoutPassword } = userData;
      
      await this.kafkaClient.emit('user.updated', {
        id: userDataWithoutPassword.id,
        email: userDataWithoutPassword.email,
        firstName: userDataWithoutPassword.firstName,
        lastName: userDataWithoutPassword.lastName,
        role: userDataWithoutPassword.role,
        updatedAt: new Date().toISOString(),
        eventId: this.generateEventId(),
      });
      
      this.logger.log(`Published user.updated event for user: ${userData.id}`, 'EventsService');
    } catch (error) {
      this.logger.error('Failed to publish user.updated event', error, 'EventsService');
    }
  }

  /**
   * Publish a password reset requested event
   * @param userId User ID
   */
  async publishPasswordResetRequested(userId: string): Promise<void> {
    try {
      await this.kafkaClient.emit('user.password.reset.requested', {
        userId,
        timestamp: new Date().toISOString(),
        eventId: this.generateEventId(),
      });
      
      this.logger.log(`Published password reset requested event for user: ${userId}`, 'EventsService');
    } catch (error) {
      this.logger.error('Failed to publish password reset requested event', error, 'EventsService');
    }
  }

  /**
   * Generate a unique event ID
   * @returns Unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
