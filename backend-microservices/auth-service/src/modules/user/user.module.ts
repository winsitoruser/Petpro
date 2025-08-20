import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from './user.controller';
import { InternalUserController } from './internal-user.controller';
import { UserService } from './user.service';
import { User } from '../../models/user.model';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    EventsModule
  ],
  controllers: [UserController, InternalUserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
