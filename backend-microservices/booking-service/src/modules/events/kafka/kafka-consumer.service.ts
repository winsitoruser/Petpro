import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, ConsumerSubscribeTopics, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger = new Logger(KafkaConsumerService.name);
  private readonly eventHandlers = new Map<string, Function>();

  constructor(private readonly configService: ConfigService) {
    // Initialize Kafka client
    const brokers = this.configService.get<string>('KAFKA_BROKERS').split(',');
    const ssl = this.configService.get<string>('KAFKA_SSL') === 'true';
    const username = this.configService.get<string>('KAFKA_USERNAME');
    const password = this.configService.get<string>('KAFKA_PASSWORD');

    this.kafka = new Kafka({
      clientId: 'booking-service-consumer',
      brokers,
      ssl,
      ...(username && {
        sasl: {
          mechanism: 'plain',
          username,
          password,
        },
      }),
    });

    this.consumer = this.kafka.consumer({
      groupId: 'booking-consumer-group',
    });
  }

  async onModuleInit() {
    try {
      await this.connect();
      
      // Subscribe to topics
      const topics = [
        'user.created',
        'user.updated',
        'user.deleted',
        'payment.processed',
        'payment.failed',
        'notification.sent',
      ];

      await this.subscribe(topics);
      
      // Start consuming messages
      await this.consume();
      
      this.logger.log('Kafka consumer initialized and listening for messages');
    } catch (error) {
      this.logger.error(`Failed to initialize Kafka consumer: ${error.message}`);
      throw error;
    }
  }

  private async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      this.logger.log('Kafka consumer connected successfully');
    } catch (error) {
      this.logger.error(`Failed to connect Kafka consumer: ${error.message}`);
      throw error;
    }
  }

  private async subscribe(topics: string[]): Promise<void> {
    try {
      const subscribeTopics: ConsumerSubscribeTopics = {
        topics,
        fromBeginning: false,
      };
      await this.consumer.subscribe(subscribeTopics);
      this.logger.log(`Kafka consumer subscribed to topics: ${topics.join(', ')}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topics: ${error.message}`);
      throw error;
    }
  }

  private async consume(): Promise<void> {
    try {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const { topic, partition, message } = payload;
          const value = message.value.toString();
          const key = message.key?.toString();
          
          this.logger.debug(`Received message from topic ${topic}[${partition}]: ${value}`);
          
          try {
            const data = JSON.parse(value);
            
            // Process the message based on the topic
            const handler = this.eventHandlers.get(topic);
            if (handler) {
              await handler(data, key);
              this.logger.debug(`Successfully processed message from topic ${topic}`);
            } else {
              this.logger.warn(`No handler registered for topic: ${topic}`);
            }
          } catch (error) {
            this.logger.error(`Error processing message from topic ${topic}: ${error.message}`);
          }
        },
      });
    } catch (error) {
      this.logger.error(`Failed to consume messages: ${error.message}`);
      throw error;
    }
  }

  registerEventHandler(topic: string, handler: Function): void {
    this.eventHandlers.set(topic, handler);
    this.logger.log(`Registered event handler for topic: ${topic}`);
  }

  async disconnectConsumer(): Promise<void> {
    try {
      await this.consumer.disconnect();
      this.logger.log('Kafka consumer disconnected successfully');
    } catch (error) {
      this.logger.error(`Failed to disconnect Kafka consumer: ${error.message}`);
    }
  }
}
