import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { HealthModule } from './modules/health/health.module';
import { BookingModule } from './modules/booking/booking.module';
import { ServiceModule } from './modules/service/service.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { EventsModule } from './events/events.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'petpro_booking_dev'),
        autoLoadModels: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production' 
          ? console.log 
          : false,
        define: {
          timestamps: true,
          underscored: true,
        },
        pool: {
          max: 20,
          min: 5,
          acquire: 60000,
          idle: 10000,
        },
      }),
    }),
    LoggerModule,
    EventsModule,
    HealthModule,
    BookingModule,
    ServiceModule,
    AvailabilityModule,
  ],
})
export class AppModule {}
