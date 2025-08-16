import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { LoggerModule } from './common/logger/logger.module';
import { EventsModule } from './events/events.module';
import { PetModule } from './modules/pet/pet.module';
import { PetHealthModule } from './modules/pet-health/pet-health.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`],
    }),
    
    // Common modules
    LoggerModule,
    DatabaseModule,
    EventsModule,
    HealthModule,
    
    // Feature modules
    AuthModule,
    UserModule,
    PetModule,
    PetHealthModule,
    ActivitiesModule,
    AnalyticsModule,
    IntegrationModule,
  ],
})
export class AppModule {}
