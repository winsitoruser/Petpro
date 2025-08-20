import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test', 'staging').default('development'),
        PORT: Joi.number().default(3004),
        
        // Database
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        
        // JWT Authentication
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1h'),
        
        // Redis
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().optional(),
        REDIS_DB: Joi.number().default(0),
      }),
    }),
    
    // Database
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: false, // Disable auto sync, use migrations only
        logging: configService.get('NODE_ENV') !== 'production' ? console.log : false,
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
      inject: [ConfigService],
    }),
    
    // JWT Authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRATION', '1h') },
      }),
      inject: [ConfigService],
    }),
    
    // Redis for microservice communication
    RedisModule,
    
    // Feature modules
    DatabaseModule,
    HealthModule,
    VendorModule,
  ],
})
export class AppModule {}
