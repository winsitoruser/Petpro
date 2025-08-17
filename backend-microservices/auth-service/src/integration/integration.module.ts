import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomerIntegrationService } from './customer-integration.service';
import { CustomerIntegrationController } from './customer-integration.controller';
import { User } from '../models/user.model';
import { UserAddress } from '../models/user-address.model';
import { Pet } from '../models/pet.model';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    SequelizeModule.forFeature([User, UserAddress, Pet]),
    ActivitiesModule,
  ],
  controllers: [CustomerIntegrationController],
  providers: [CustomerIntegrationService],
  exports: [CustomerIntegrationService],
})
export class IntegrationModule {}
