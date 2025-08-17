import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { LoggerModule } from './common/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.registerAsync([
      {
        name: 'ADMIN_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'admin-gateway',
              brokers: [configService.get('KAFKA_BROKERS') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'admin-gateway-group',
            },
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'INVENTORY_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'admin-gateway-inventory',
              brokers: [configService.get('KAFKA_BROKERS') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'admin-gateway-inventory-group',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    LoggerModule,
    AuthModule,
    AdminModule,
    InventoryModule,
    HealthModule,
  ],
})
export class AppModule {}