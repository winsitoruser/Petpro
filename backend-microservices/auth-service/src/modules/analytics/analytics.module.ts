import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../users/models/user.model';
import { Activity } from '../activities/models/activity.model';
import { Pet } from '../pets/models/pet.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Activity, Pet]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
