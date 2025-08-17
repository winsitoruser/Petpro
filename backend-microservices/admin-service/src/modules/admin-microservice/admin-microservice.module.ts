import { Module } from '@nestjs/common';
import { AdminMicroserviceController } from './admin-microservice.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [AuthModule, UserModule, DashboardModule],
  controllers: [AdminMicroserviceController],
})
export class AdminMicroserviceModule {}