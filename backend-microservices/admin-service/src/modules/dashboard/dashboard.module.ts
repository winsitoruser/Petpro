import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AdminUser } from '../../models/admin-user.model';
import { UserSession } from '../../models/user-session.model';
import { SystemLog } from '../../models/system-log.model';

@Module({
  imports: [SequelizeModule.forFeature([AdminUser, UserSession, SystemLog])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService]
})
export class DashboardModule {}