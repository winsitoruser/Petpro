import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { ServiceAvailability } from '../../models/service-availability.model';
import { Service } from '../../models/service.model';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ServiceAvailability, Service]),
    EventsModule
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService]
})
export class AvailabilityModule {}
