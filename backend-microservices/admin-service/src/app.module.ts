import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { AdminMicroserviceModule } from './modules/admin-microservice/admin-microservice.module';
import { LoggerModule } from './common/logger/logger.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    LoggerModule,
    AuthModule,
    UserModule,
    DashboardModule,
    HealthModule,
    AdminMicroserviceModule,
  ],
})
export class AppModule {}