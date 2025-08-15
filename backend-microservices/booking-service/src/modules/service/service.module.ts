import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { Service } from '../../models/service.model';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Service]),
    EventsModule
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService]
})
export class ServiceModule {}
