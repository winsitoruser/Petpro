import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { HealthModule } from './modules/health/health.module';
import { BookingModule } from './modules/booking/booking.module';
import { ServiceModule } from './modules/service/service.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { RedisModule } from './redis/redis.module';
import { LoggerModule } from './common/logger/logger.module';
import { ReviewModule } from './modules/review/review.module';

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
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'petpro_booking_dev'),
        autoLoadModels: true,
        synchronize: false, // Disable auto sync, use migrations only
        logging: configService.get('NODE_ENV') !== 'production' 
          ? console.log 
          : false,
        define: {
          timestamps: true,
          underscored: true,
        },
        dialectOptions: {
          ssl: configService.get('DB_HOST') && configService.get('DB_HOST').includes('rds.amazonaws.com') ? {
            require: true,
            rejectUnauthorized: false
          } : false
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
    RedisModule,
    HealthModule,
    BookingModule,
    ServiceModule,
    AvailabilityModule,
    ReviewModule,
  ],
})
export class AppModule {}
