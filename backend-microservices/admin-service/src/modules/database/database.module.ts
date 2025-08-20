import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminUser } from '../../models/admin-user.model';
import { UserSession } from '../../models/user-session.model';
import { SystemLog } from '../../models/system-log.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || 'postgres',
        database: configService.get('DB_DATABASE') || 'petpro_vendor_dev',
        models: [AdminUser, UserSession, SystemLog],
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
  ],
})
export class DatabaseModule { }