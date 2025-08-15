import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { BookingEventsController } from './booking-events.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BOOKING_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'booking-service',
              brokers: configService.get('KAFKA_BROKERS').split(','),
              ssl: configService.get('KAFKA_SSL') === 'true',
              ...(configService.get('KAFKA_USERNAME') && {
                sasl: {
                  mechanism: 'plain',
                  username: configService.get('KAFKA_USERNAME'),
                  password: configService.get('KAFKA_PASSWORD'),
                },
              }),
            },
            consumer: {
              groupId: 'booking-consumer-group',
              allowAutoTopicCreation: true,
            },
            producer: {
              allowAutoTopicCreation: true,
              idempotent: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [BookingEventsController],
  providers: [KafkaProducerService, KafkaConsumerService],
  exports: [KafkaProducerService, KafkaConsumerService],
})
export class KafkaModule {}
