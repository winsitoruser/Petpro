import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { BookingService } from '../../booking/booking.service';
import { PetService } from '../../pet/pet.service';
import { ServiceService } from '../../service/service.service';

@Controller()
export class BookingEventsController {
  private readonly logger = new Logger(BookingEventsController.name);

  constructor(
    private readonly bookingService: BookingService,
    private readonly petService: PetService,
    private readonly serviceService: ServiceService,
  ) {}

  @EventPattern('user.created')
  async handleUserCreated(@Payload() data: any, @Ctx() context: KafkaContext) {
    this.logger.log(`Received user.created event: ${JSON.stringify(data)}`);
    // No specific action needed in booking service when users are created
    // but we could store user preferences for booking if needed
  }

  @EventPattern('user.updated')
  async handleUserUpdated(@Payload() data: any, @Ctx() context: KafkaContext) {
    this.logger.log(`Received user.updated event: ${JSON.stringify(data)}`);
    // Update any user-related data in bookings if needed
  }

  @EventPattern('user.deleted')
  async handleUserDeleted(@Payload() data: any, @Ctx() context: KafkaContext) {
    this.logger.log(`Received user.deleted event: ${JSON.stringify(data)}`);
    try {
      // Handle user deletion by anonymizing their bookings or marking them
      await this.bookingService.handleUserDeletion(data.id);
      this.logger.log(`Successfully handled user deletion for ID: ${data.id}`);
    } catch (error) {
      this.logger.error(`Error handling user deletion: ${error.message}`);
    }
  }

  @EventPattern('payment.processed')
  async handlePaymentProcessed(@Payload() data: any, @Ctx() context: KafkaContext) {
    this.logger.log(`Received payment.processed event: ${JSON.stringify(data)}`);
    try {
      // Update booking with payment information
      if (data.bookingId) {
        await this.bookingService.updatePaymentStatus(
          data.bookingId, 
          data.paymentId, 
          'paid', 
          data.amount
        );
        this.logger.log(`Updated booking ${data.bookingId} with payment status: paid`);
      }
    } catch (error) {
      this.logger.error(`Error handling payment processed event: ${error.message}`);
    }
  }

  @EventPattern('payment.failed')
  async handlePaymentFailed(@Payload() data: any, @Ctx() context: KafkaContext) {
    this.logger.log(`Received payment.failed event: ${JSON.stringify(data)}`);
    try {
      // Update booking with failed payment status
      if (data.bookingId) {
        await this.bookingService.updatePaymentStatus(
          data.bookingId, 
          data.paymentId, 
          'failed', 
          data.amount
        );
        this.logger.log(`Updated booking ${data.bookingId} with payment status: failed`);
      }
    } catch (error) {
      this.logger.error(`Error handling payment failed event: ${error.message}`);
    }
  }

  @EventPattern('notification.sent')
  async handleNotificationSent(@Payload() data: any, @Ctx() context: KafkaContext) {
    this.logger.log(`Received notification.sent event: ${JSON.stringify(data)}`);
    try {
      // If the notification was about a booking, update the booking record
      if (data.type === 'booking_reminder' && data.bookingId) {
        await this.bookingService.updateNotificationStatus(
          data.bookingId,
          data.notificationType,
          data.status
        );
        this.logger.log(`Updated notification status for booking ${data.bookingId}`);
      }
    } catch (error) {
      this.logger.error(`Error handling notification sent event: ${error.message}`);
    }
  }
}
