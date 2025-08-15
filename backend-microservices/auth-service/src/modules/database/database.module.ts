import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoggerService } from '../../common/logger/logger.service';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, LoggerService],
      useFactory: (configService: ConfigService, loggerService: LoggerService) => {
        const env = configService.get<string>('NODE_ENV') || 'development';
        const host = configService.get<string>('DB_HOST') || 'localhost';
        const port = configService.get<number>('DB_PORT') || 5432;
        const username = configService.get<string>('DB_USERNAME') || 'postgres';
        const password = configService.get<string>('DB_PASSWORD') || 'postgres';
        const database = configService.get<string>('DB_NAME') || `petpro_auth_${env}`;
        
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
          synchronize: env === 'development', // Only in development
          logging: (msg) => loggerService.debug(msg, 'Sequelize'),
          define: {
            timestamps: true,
            underscored: true,
          },
          dialectOptions: env === 'production' 
            ? { ssl: { require: true, rejectUnauthorized: false } } 
            : {},
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
