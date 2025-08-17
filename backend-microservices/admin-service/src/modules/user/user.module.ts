import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AdminUser } from '../../models/admin-user.model';
import { UserSession } from '../../models/user-session.model';
import { SystemLog } from '../../models/system-log.model';

@Module({
  imports: [SequelizeModule.forFeature([AdminUser, UserSession, SystemLog])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}