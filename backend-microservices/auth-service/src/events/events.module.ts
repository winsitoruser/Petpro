import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventsService } from './events.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: configService.get<string>('KAFKA_CLIENT_ID'),
              brokers: configService.get<string>('KAFKA_BROKERS').split(','),
              ssl: configService.get<string>('NODE_ENV') === 'production',
              connectionTimeout: 3000,
              retry: {
                initialRetryTime: 300,
                retries: 5,
              },
            },
            consumer: {
              groupId: configService.get<string>('KAFKA_GROUP_ID'),
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
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
