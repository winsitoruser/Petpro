import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerService } from '../../common/logger/logger.service';
import { Sequelize } from 'sequelize-typescript';
import * as path from 'path';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, LoggerService],
      useFactory: (configService: ConfigService, loggerService: LoggerService) => {
        const env = configService.get<string>('NODE_ENV') || 'development';
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<number>('DB_PORT') || 5432;
        const username = configService.get<string>('DB_USERNAME') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';
        const database = configService.get<string>('DB_DATABASE') || `petpro_vendor_dev`;
        
        // Log database connection info (without sensitive data)
        loggerService.log(
          `Connecting to database ${database} at ${host}:${port}`,
          'DatabaseModule'
        );
        
        return {
          dialect: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadModels: true,
          synchronize: true, // Enable auto sync for automatic migration
          logging: (msg) => loggerService.debug(msg, 'Sequelize'),
          define: {
            timestamps: true,
            underscored: true,
          },
          dialectOptions: {
            ssl: host && host.includes('rds.amazonaws.com') ? {
              require: true,
              rejectUnauthorized: false
            } : false
          },
          pool: {
            max: env === 'production' ? 20 : 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
