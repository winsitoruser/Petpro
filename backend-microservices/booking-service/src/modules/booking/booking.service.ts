import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Booking, BookingStatus } from '../../models/booking.model';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Service } from '../../models/service.model';
import { Pet } from '../../models/pet.model';
import { ServiceAvailability } from '../../models/service-availability.model';
import { KafkaProducerService } from '../events/kafka/kafka-producer.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking)
    private readonly bookingModel: typeof Booking,
    @InjectModel(Service)
    private readonly serviceModel: typeof Service,
    @InjectModel(Pet)
    private readonly petModel: typeof Pet,
    @InjectModel(ServiceAvailability)
    private readonly serviceAvailabilityModel: typeof ServiceAvailability,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Validate that service exists
    const service = await this.serviceModel.findByPk(createBookingDto.serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${createBookingDto.serviceId} not found`);
    }

    // Validate that pet exists
    const pet = await this.petModel.findByPk(createBookingDto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${createBookingDto.petId} not found`);
    }

    // Check if the time slot is available
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    const conflictingBooking = await this.bookingModel.findOne({
      where: {
        serviceId: createBookingDto.serviceId,
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime },
          },
        ],
        status: {
          [Op.notIn]: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        },
      },
    });

    if (conflictingBooking) {
      throw new ConflictException('The selected time slot is not available');
    }

    try {
      // Create booking with calculated end time and price from service
      const booking = await this.bookingModel.create({
        ...createBookingDto,
        startTime,
        endTime,
        totalPrice: service.price,
        service, // Passing service for the hook to calculate endTime properly
      });

      this.logger.log(`Booking created: ${booking.id}`);

      // Publish event for booking created via Kafka
      await this.kafkaProducer.emitBookingCreated({
        id: booking.id,
        user_id: booking.customerId,
        service_id: booking.serviceId,
        pet_id: booking.petId,
        start_time: booking.startTime,
        end_time: booking.endTime,
        status: booking.status,
      });

      return booking;
    } catch (error) {
      this.logger.error(`Failed to create booking: ${error.message}`);
      throw new BadRequestException('Failed to create booking');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    customerId?: string,
    providerId?: string,
    status?: BookingStatus,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<{ bookings: Booking[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {};
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Date range filter
    if (fromDate || toDate) {
      where.startTime = {};
      
      if (fromDate) {
        where.startTime[Op.gte] = fromDate;
      }
      
      if (toDate) {
        where.startTime[Op.lte] = toDate;
      }
    }

    // For provider filtering, we need to join with the service model
    const include = [];
    if (providerId) {
      include.push({
        model: Service,
        where: {
          providerId,
        },
        required: true,
      });
    } else {
      include.push(Service);
    }
    
    // Always include Pet
    include.push(Pet);

    try {
      const { count, rows } = await this.bookingModel.findAndCountAll({
        where,
        include,
        limit,
        offset,
        order: [['startTime', 'DESC']],
      });

      return {
        bookings: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch bookings: ${error.message}`);
      throw new BadRequestException('Failed to fetch bookings');
    }
  }

  async findById(id: string): Promise<Booking> {
    try {
      const booking = await this.bookingModel.findByPk(id, {
        include: [Service, Pet],
      });
      
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }
      
      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch booking with ID ${id}: ${error.message}`);
      throw new BadRequestException('Failed to fetch booking');
    }
  }

  async findByReference(reference: string): Promise<Booking> {
    try {
      const booking = await this.bookingModel.findOne({
        where: { bookingReference: reference },
        include: [Service, Pet],
      });
      
      if (!booking) {
        throw new NotFoundException(`Booking with reference ${reference} not found`);
      }
      
      return booking;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch booking with reference ${reference}: ${error.message}`);
      throw new BadRequestException('Failed to fetch booking');
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findById(id);

    // If service is being changed, validate new service and recalculate endTime
    let service = booking.service;
    if (updateBookingDto.serviceId && updateBookingDto.serviceId !== booking.serviceId) {
      service = await this.serviceModel.findByPk(updateBookingDto.serviceId);
      if (!service) {
        throw new NotFoundException(`Service with ID ${updateBookingDto.serviceId} not found`);
      }
    }

    // If pet is being changed, validate new pet
    if (updateBookingDto.petId && updateBookingDto.petId !== booking.petId) {
      const pet = await this.petModel.findByPk(updateBookingDto.petId);
      if (!pet) {
        throw new NotFoundException(`Pet with ID ${updateBookingDto.petId} not found`);
      }
    }

    // If startTime is being changed, check for conflicts
    if (updateBookingDto.startTime) {
      const startTime = new Date(updateBookingDto.startTime);
      const endTime = new Date(startTime.getTime() + service.duration * 60000);

      const conflictingBooking = await this.bookingModel.findOne({
        where: {
          id: { [Op.ne]: id }, // Exclude current booking
          serviceId: updateBookingDto.serviceId || booking.serviceId,
          [Op.or]: [
            {
              startTime: { [Op.lt]: endTime },
              endTime: { [Op.gt]: startTime },
            },
          ],
          status: {
            [Op.notIn]: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
          },
        },
      });

      if (conflictingBooking) {
        throw new ConflictException('The selected time slot is not available');
      }
    }

    try {
      // Update booking
      await booking.update({
        ...updateBookingDto,
        // If startTime was provided, recalculate endTime based on service duration
        ...(updateBookingDto.startTime && {
          startTime: new Date(updateBookingDto.startTime),
          endTime: new Date(new Date(updateBookingDto.startTime).getTime() + service.duration * 60000),
        }),
        // Update price if service changed
        ...(updateBookingDto.serviceId && { totalPrice: service.price }),
      });

      this.logger.log(`Booking updated: ${id}`);
      
      // Publish event for booking updated via Kafka
      await this.kafkaProducer.emitBookingUpdated({
        id: booking.id,
        user_id: booking.customerId,
        service_id: booking.serviceId,
        pet_id: booking.petId,
        start_time: booking.startTime,
        end_time: booking.endTime,
        status: booking.status,
      });

      // Reload booking with associations
      return this.findById(id);
    } catch (error) {
      this.logger.error(`Failed to update booking ${id}: ${error.message}`);
      throw new BadRequestException('Failed to update booking');
    }
  }

  async cancel(id: string): Promise<boolean> {
    const booking = await this.findById(id);

    if (booking.status === BookingStatus.CANCELLED) {
      return true; // Already cancelled
    }

    try {
      await booking.update({ status: BookingStatus.CANCELLED });
      
      this.logger.log(`Booking cancelled: ${id}`);
      
      // Publish event for booking cancelled via Kafka
      await this.kafkaProducer.emitBookingCancelled({
        id: booking.id,
        user_id: booking.customerId,
        service_id: booking.serviceId,
        status: BookingStatus.CANCELLED,
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel booking ${id}: ${error.message}`);
      throw new BadRequestException('Failed to cancel booking');
    }
  }

  async confirm(id: string): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.status === BookingStatus.CONFIRMED) {
      return booking; // Already confirmed
    }

    try {
      await booking.update({ status: BookingStatus.CONFIRMED });
      
      this.logger.log(`Booking confirmed: ${id}`);
      
      // Publish event for booking confirmed via Kafka
      await this.kafkaProducer.emitBookingUpdated({
        id: booking.id,
        user_id: booking.customerId,
        service_id: booking.serviceId,
        status: BookingStatus.CONFIRMED,
        start_time: booking.startTime,
        end_time: booking.endTime,
      });
      
      return this.findById(id);
    } catch (error) {
      this.logger.error(`Failed to confirm booking ${id}: ${error.message}`);
      throw new BadRequestException('Failed to confirm booking');
    }
  }

  async getUpcomingBookings(
    customerId?: string, 
    providerId?: string,
    days = 7,
  ): Promise<Booking[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    // Build where clause
    const where: any = {
      startTime: {
        [Op.gte]: now,
        [Op.lt]: future,
      },
      status: {
        [Op.notIn]: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
      },
    };

    if (customerId) {
      where.customerId = customerId;
    }

    // For provider filtering, we need to join with the service model
    const include = [];
    if (providerId) {
      include.push({
        model: Service,
        where: {
          providerId,
        },
        required: true,
      });
    } else {
      include.push(Service);
    }
    
    // Always include Pet
    include.push(Pet);

    try {
      return await this.bookingModel.findAll({
        where,
        include,
        order: [['startTime', 'ASC']],
      });
    } catch (error) {
      this.logger.error(`Failed to fetch upcoming bookings: ${error.message}`);
      throw new BadRequestException('Failed to fetch upcoming bookings');
    }
  }

  async sendReminder(id: string): Promise<boolean> {
    const booking = await this.findById(id);

    try {
      await booking.update({ 
        reminderSent: true,
        reminderSentAt: new Date(),
      });
      
      this.logger.log(`Booking reminder sent: ${id}`);
      
      // In a real implementation, we would integrate with a notification service
      // to send an email or SMS reminder to the customer
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to mark reminder sent for booking ${id}: ${error.message}`);
      throw new BadRequestException('Failed to send reminder');
    }
  }

  /**
   * Handles user deletion by anonymizing their bookings
   * Called when user.deleted event is received
   */
  async handleUserDeletion(userId: string): Promise<void> {
    this.logger.log(`Handling user deletion for user ${userId}`);
    
    try {
      // Find all bookings for this user
      const bookings = await this.bookingModel.findAll({
        where: { customerId: userId }
      });
      
      if (!bookings || bookings.length === 0) {
        this.logger.log(`No bookings found for user ${userId}`);
        return;
      }
      
      // Update all bookings to anonymize them
      // We're keeping the records but removing personal information
      for (const booking of bookings) {
        await booking.update({
          customerNotes: 'User data removed',
          anonymized: true,
          anonymizedAt: new Date()
        });
      }
      
      this.logger.log(`Successfully anonymized ${bookings.length} bookings for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to handle user deletion for ${userId}: ${error.message}`);
      throw new BadRequestException(`Failed to process user deletion`);
    }
  }

  /**
   * Updates the payment status for a booking
   * Called when payment.processed or payment.failed events are received
   */
  async updatePaymentStatus(
    bookingId: string, 
    paymentId: string, 
    paymentStatus: string,
    amount: number
  ): Promise<void> {
    this.logger.log(`Updating payment status for booking ${bookingId} to ${paymentStatus}`);
    
    try {
      const booking = await this.findById(bookingId);
      
      await booking.update({
        paymentId,
        paymentStatus,
        amountPaid: amount,
        paymentUpdatedAt: new Date()
      });
      
      // If payment was successful and status was pending, update to confirmed
      if (paymentStatus === 'paid' && booking.status === BookingStatus.PENDING) {
        await booking.update({ status: BookingStatus.CONFIRMED });
        
        // Emit booking confirmed event
        await this.kafkaProducer.emitBookingUpdated({
          id: booking.id,
          user_id: booking.customerId,
          service_id: booking.serviceId,
          status: BookingStatus.CONFIRMED,
          start_time: booking.startTime,
          end_time: booking.endTime,
        });
      }
      
      this.logger.log(`Successfully updated payment status for booking ${bookingId}`);
    } catch (error) {
      this.logger.error(`Failed to update payment status for booking ${bookingId}: ${error.message}`);
      throw new BadRequestException('Failed to update payment status');
    }
  }

  /**
   * Updates notification status for a booking
   * Called when notification.sent event is received
   */
  async updateNotificationStatus(
    bookingId: string,
    notificationType: string,
    status: string
  ): Promise<void> {
    this.logger.log(`Updating notification status for booking ${bookingId}, type: ${notificationType}`);
    
    try {
      const booking = await this.findById(bookingId);
      
      // Store notification data based on type
      const notificationData = {
        type: notificationType,
        status,
        timestamp: new Date()
      };
      
      // In a real implementation, we would store this in a notifications table
      // or in a JSON column in the booking table
      // For now, we'll just update reminder fields
      if (notificationType === 'reminder') {
        await booking.update({
          reminderSent: status === 'delivered',
          reminderSentAt: new Date()
        });
      } else if (notificationType === 'confirmation') {
        await booking.update({
          confirmationSent: status === 'delivered',
          confirmationSentAt: new Date()
        });
      }
      
      this.logger.log(`Successfully updated notification status for booking ${bookingId}`);
    } catch (error) {
      this.logger.error(`Failed to update notification status for booking ${bookingId}: ${error.message}`);
      throw new BadRequestException('Failed to update notification status');
    }
  }
  
  /**
   * Finds all services with optional filters
   * Used by the API gateway microservice controller
   */
  async findAllServices(query: any) {
    this.logger.log(`Finding all services with query: ${JSON.stringify(query)}`);
    
    const { page = 1, limit = 10, name, category, providerId } = query;
    const offset = (page - 1) * limit;
    
    const where: any = {};
    
    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }
    
    if (category) {
      where.category = category;
    }
    
    if (providerId) {
      where.providerId = providerId;
    }
    
    try {
      const { rows, count } = await this.serviceModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['name', 'ASC']],
      });
      
      return {
        data: rows,
        meta: {
          total: count,
          page: +page,
          limit: +limit,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find services: ${error.message}`);
      throw new BadRequestException(`Failed to find services: ${error.message}`);
    }
  }
  
  /**
   * Find a service by ID
   * Used by the API gateway microservice controller
   */
  async findServiceById(id: string) {
    this.logger.log(`Finding service with ID: ${id}`);
    
    try {
      const service = await this.serviceModel.findByPk(id);
      
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      
      return service;
    } catch (error) {
      this.logger.error(`Failed to find service with ID ${id}: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to find service`);
    }
  }
  
  /**
   * Find availability for services
   * Used by the API gateway microservice controller
   */
  async findAvailability(query: any) {
    this.logger.log(`Finding availability with query: ${JSON.stringify(query)}`);
    
    const { serviceId, startDate, endDate, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;
    
    if (!serviceId) {
      throw new BadRequestException('Service ID is required');
    }
    
    if (!startDate) {
      throw new BadRequestException('Start date is required');
    }
    
    // If no end date provided, default to 7 days from start
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : new Date(parsedStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    try {
      // First, check if service exists
      const service = await this.serviceModel.findByPk(serviceId);
      
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }
      
      // Find availability slots
      const where: any = {
        serviceId,
        startTime: {
          [Op.gte]: parsedStartDate,
          [Op.lt]: parsedEndDate,
        },
        isAvailable: true,
      };
      
      const { rows, count } = await this.serviceAvailabilityModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['startTime', 'ASC']],
      });
      
      return {
        data: rows,
        meta: {
          total: count,
          page: +page,
          limit: +limit,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to find availability: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to find availability`);
    }
  }
}
