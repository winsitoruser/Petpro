import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from '../../models/booking.model';
import { Service } from '../../models/service.model';
import { Pet } from '../../models/pet.model';
import { ServiceAvailability } from '../../models/service-availability.model';
import { BookingMicroserviceController } from './booking-microservice.controller';
import { KafkaModule } from '../events/kafka/kafka.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Booking, Service, Pet, ServiceAvailability]),
    KafkaModule,
    EventsModule,
  ],
  controllers: [BookingController, BookingMicroserviceController],
  providers: [BookingService],
  exports: [BookingService]
})
export class BookingModule {}
