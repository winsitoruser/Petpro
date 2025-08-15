import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { BookingMicroserviceController } from './booking-microservice.controller';
import { Booking } from '../../models/booking.model';
import { Service } from '../../models/service.model';
import { Pet } from '../../models/pet.model';
import { ServiceAvailability } from '../../models/service-availability.model';
import { EventsModule } from '../../events/events.module';
import { KafkaModule } from '../events/kafka/kafka.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Booking, Service, Pet, ServiceAvailability]),
    EventsModule,
    KafkaModule
  ],
  controllers: [BookingController, BookingMicroserviceController],
  providers: [BookingService],
  exports: [BookingService]
})
export class BookingModule {}
