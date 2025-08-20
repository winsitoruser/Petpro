import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from '../../models/booking.model';
import { Service } from '../../models/service.model';
import { Pet } from '../../models/pet.model';
import { ServiceAvailability } from '../../models/service-availability.model';
import { BookingMicroserviceController } from './booking-microservice.controller';
import { EventsModule } from '../events/events.module';
import { SharedModule } from '../../shared/shared.module';
import { UserIntegrationService } from '../../services/user-integration.service';
import { EnhancedBookingService } from '../../services/enhanced-booking.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Booking, Service, Pet, ServiceAvailability]),
    EventsModule,
    SharedModule,
  ],
  controllers: [BookingController, BookingMicroserviceController],
  providers: [BookingService, UserIntegrationService, EnhancedBookingService],
  exports: [BookingService, UserIntegrationService, EnhancedBookingService]
})
export class BookingModule {}
