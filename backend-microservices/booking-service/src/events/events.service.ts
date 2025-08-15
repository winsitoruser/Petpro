import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, KafkaMessage } from 'kafkajs';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private readonly topics = {
    bookingCreated: 'booking.created',
    bookingUpdated: 'booking.updated',
    bookingCancelled: 'booking.cancelled',
    bookingConfirmed: 'booking.confirmed',
    userCreated: 'user.created',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    // Initialize Kafka client
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'booking-service'),
      brokers: this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    // Initialize producer
    this.producer = this.kafka.producer();

    // Initialize consumer with consumer group ID
    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>('KAFKA_GROUP_ID', 'booking-service-group'),
    });
  }

  async onModuleInit() {
    try {
      // Connect producer
      await this.producer.connect();
      this.logger.log('Kafka producer connected', 'EventsService');

      // Connect consumer
      await this.consumer.connect();
      this.logger.log('Kafka consumer connected', 'EventsService');

      // Subscribe to relevant topics
      await this.consumer.subscribe({
        topics: [this.topics.userCreated],
        fromBeginning: false,
      });

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          this.handleIncomingMessage(topic, message);
        },
      });

      this.logger.log('Kafka consumer subscribed to topics', 'EventsService');
    } catch (error) {
      this.logger.error('Failed to initialize Kafka connections', error, 'EventsService');
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('Kafka connections closed', 'EventsService');
    } catch (error) {
      this.logger.error('Failed to disconnect Kafka connections', error, 'EventsService');
    }
  }

  /**
   * Publish booking created event
   * @param bookingData Object containing booking details
   */
  async publishBookingCreated(bookingData: any): Promise<void> {
    return this.sendMessage(this.topics.bookingCreated, bookingData);
  }

  /**
   * Publish booking updated event
   * @param bookingData Object containing updated booking details
   */
  async publishBookingUpdated(bookingData: any): Promise<void> {
    return this.sendMessage(this.topics.bookingUpdated, bookingData);
  }

  /**
   * Publish booking cancelled event
   * @param bookingData Object containing cancelled booking details
   */
  async publishBookingCancelled(bookingData: any): Promise<void> {
    return this.sendMessage(this.topics.bookingCancelled, bookingData);
  }

  /**
   * Publish booking confirmed event
   * @param bookingData Object containing confirmed booking details
   */
  async publishBookingConfirmed(bookingData: any): Promise<void> {
    return this.sendMessage(this.topics.bookingConfirmed, bookingData);
  }

  /**
   * Send message to specified topic
   * @param topic Kafka topic
   * @param message Message payload
   * @private
   */
  private async sendMessage(topic: string, message: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            value: JSON.stringify({
              ...message,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });
      this.logger.debug(`Published message to ${topic}`, 'EventsService');
    } catch (error) {
      this.logger.error(`Failed to publish message to ${topic}`, error, 'EventsService');
      throw error;
    }
  }

  /**
   * Handle incoming Kafka messages
   * @param topic Message topic
   * @param message Kafka message
   * @private
   */
  private handleIncomingMessage(topic: string, message: KafkaMessage): void {
    try {
      const payload = JSON.parse(message.value.toString());
      this.logger.debug(`Received message from ${topic}`, 'EventsService');

      switch (topic) {
        case this.topics.userCreated:
          this.handleUserCreated(payload);
          break;
        default:
          this.logger.warn(`No handler for message from topic ${topic}`, 'EventsService');
      }
    } catch (error) {
      this.logger.error(`Failed to process message from ${topic}`, error, 'EventsService');
    }
  }

  /**
   * Handle user created event
   * @param userData User data from auth service
   * @private
   */
  private handleUserCreated(userData: any): void {
    // Process user created event
    // This might involve creating a customer profile or vendor profile
    // in the booking service database
    this.logger.debug(`Processing user created: ${userData.id}`, 'EventsService');
  }
}
