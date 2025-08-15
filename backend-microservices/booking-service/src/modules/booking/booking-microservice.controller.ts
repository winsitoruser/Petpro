import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller()
export class BookingMicroserviceController {
  constructor(private readonly bookingService: BookingService) {}

  @MessagePattern('booking.findAll')
  async findAll(@Payload() payload: any) {
    const { page = 1, limit = 10, userId, userRole, customerId, providerId, status, fromDate, toDate } = payload;
    
    // Role-based access control
    let customerIdFilter = customerId;
    let providerIdFilter = providerId;
    
    if (userRole === 'customer') {
      customerIdFilter = userId;
    }

    if (userRole === 'vendor') {
      providerIdFilter = userId;
    }
    
    return this.bookingService.findAll(
      page,
      limit,
      customerIdFilter,
      providerIdFilter,
      status,
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined,
    );
  }

  @MessagePattern('booking.findOne')
  async findOne(@Payload() payload: any) {
    const { id, userId, userRole } = payload;
    const booking = await this.bookingService.findById(id);
    
    // Role-based access control
    if (userRole === 'customer' && booking.customerId !== userId) {
      return { error: 'You do not have permission to view this booking' };
    }

    if (userRole === 'vendor' && booking.service && booking.service.providerId !== userId) {
      return { error: 'You do not have permission to view this booking' };
    }
    
    return booking;
  }

  @MessagePattern('booking.create')
  async create(@Payload() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @MessagePattern('booking.update')
  async update(@Payload() payload: any) {
    const { id, userId, userRole, ...updateData } = payload;
    const booking = await this.bookingService.findById(id);
    
    // Role-based access control
    if (userRole === 'customer') {
      if (booking.customerId !== userId) {
        return { error: 'You can only update your own bookings' };
      }

      // Customers can only update specific fields
      const allowedFields = ['specialRequests'];
      const attemptedFields = Object.keys(updateData);
      
      for (const field of attemptedFields) {
        if (!allowedFields.includes(field)) {
          return { error: `Customers cannot update the '${field}' field` };
        }
      }
    }

    if (userRole === 'vendor' && booking.service && booking.service.providerId !== userId) {
      return { error: 'You can only update bookings for your services' };
    }
    
    return this.bookingService.update(id, updateData as UpdateBookingDto);
  }

  @MessagePattern('booking.cancel')
  async cancel(@Payload() payload: any) {
    const { id, userId, userRole } = payload;
    const booking = await this.bookingService.findById(id);
    
    // Role-based access control
    if (userRole === 'customer' && booking.customerId !== userId) {
      return { error: 'You can only cancel your own bookings' };
    }

    if (userRole === 'vendor' && booking.service && booking.service.providerId !== userId) {
      return { error: 'You can only cancel bookings for your services' };
    }
    
    return { success: await this.bookingService.cancel(id) };
  }

  @MessagePattern('booking.confirm')
  async confirm(@Payload() payload: any) {
    const { id, userId, userRole } = payload;
    
    if (!['admin', 'vendor'].includes(userRole)) {
      return { error: 'Only admins and vendors can confirm bookings' };
    }
    
    const booking = await this.bookingService.findById(id);
    
    if (userRole === 'vendor' && booking.service && booking.service.providerId !== userId) {
      return { error: 'You can only confirm bookings for your services' };
    }
    
    return this.bookingService.confirm(id);
  }

  @MessagePattern('service.findAll')
  async findAllServices(@Payload() query: any) {
    // Assuming you have a service to find all services
    return this.bookingService.findAllServices(query);
  }

  @MessagePattern('service.findOne')
  async findOneService(@Payload() payload: any) {
    return this.bookingService.findServiceById(payload.id);
  }

  @MessagePattern('availability.findAll')
  async findAllAvailability(@Payload() query: any) {
    // Assuming you have a service to find availability
    return this.bookingService.findAvailability(query);
  }
}
