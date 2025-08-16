import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BookingCreatedEvent } from '../events/booking-created.event';
import { BookingStatusUpdatedEvent } from '../events/booking-status-updated.event';
import { BookingCancelledEvent } from '../events/booking-cancelled.event';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Handles new booking notifications to vendors
   */
  @OnEvent('booking.created')
  async handleBookingCreatedEvent(event: BookingCreatedEvent) {
    this.logger.log(`Handling notification for new booking: ${event.bookingId}`);
    
    try {
      // Get vendor details from auth service
      const vendorId = event.vendorId;
      const vendorDetails = await this.fetchVendorDetails(vendorId);
      
      // Send notifications through multiple channels
      await Promise.all([
        this.sendEmailNotification(
          vendorDetails.email,
          'New Booking Received',
          this.createNewBookingEmailTemplate(event, vendorDetails),
        ),
        this.sendPushNotification(
          vendorDetails.deviceTokens,
          'New Booking',
          `You have a new booking request for ${event.serviceType} on ${event.date} at ${event.time}`
        ),
        this.storeNotificationInDatabase(event, 'vendor', vendorId),
      ]);
      
      this.logger.log(`Successfully sent notifications for booking ${event.bookingId} to vendor ${vendorId}`);
    } catch (error) {
      this.logger.error(`Failed to send vendor notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles booking status update notifications
   */
  @OnEvent('booking.status.updated')
  async handleBookingStatusUpdatedEvent(event: BookingStatusUpdatedEvent) {
    this.logger.log(`Handling notification for booking status update: ${event.bookingId} - ${event.newStatus}`);
    
    try {
      // Notify customer about the status change
      const customerId = event.customerId;
      const customerDetails = await this.fetchCustomerDetails(customerId);
      
      await Promise.all([
        this.sendEmailNotification(
          customerDetails.email,
          `Booking Status Updated: ${event.newStatus}`,
          this.createStatusUpdateEmailTemplate(event, customerDetails),
        ),
        this.sendPushNotification(
          customerDetails.deviceTokens,
          'Booking Update',
          `Your booking for ${event.serviceType} has been updated to ${event.newStatus}`
        ),
        this.storeNotificationInDatabase(event, 'customer', customerId),
      ]);
      
      this.logger.log(`Successfully sent status update notification for booking ${event.bookingId} to customer ${customerId}`);
    } catch (error) {
      this.logger.error(`Failed to send status update notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Handles booking cancellation notifications
   */
  @OnEvent('booking.cancelled')
  async handleBookingCancelledEvent(event: BookingCancelledEvent) {
    this.logger.log(`Handling notification for cancelled booking: ${event.bookingId}`);
    
    try {
      // Determine who cancelled the booking and notify the other party
      const recipientType = event.cancelledBy === 'vendor' ? 'customer' : 'vendor';
      const recipientId = recipientType === 'customer' ? event.customerId : event.vendorId;
      const recipientDetails = recipientType === 'customer' 
        ? await this.fetchCustomerDetails(event.customerId)
        : await this.fetchVendorDetails(event.vendorId);
      
      await Promise.all([
        this.sendEmailNotification(
          recipientDetails.email,
          'Booking Cancellation Notice',
          this.createCancellationEmailTemplate(event, recipientDetails, recipientType),
        ),
        this.sendPushNotification(
          recipientDetails.deviceTokens,
          'Booking Cancelled',
          `A booking for ${event.serviceType} on ${event.date} has been cancelled`
        ),
        this.storeNotificationInDatabase(event, recipientType, recipientId),
      ]);
      
      this.logger.log(`Successfully sent cancellation notification for booking ${event.bookingId} to ${recipientType} ${recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to send cancellation notification: ${error.message}`, error.stack);
    }
  }

  /**
   * Fetches vendor details from auth service
   */
  private async fetchVendorDetails(vendorId: string) {
    const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/api/vendors/${vendorId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch vendor details: ${error.message}`);
      throw new Error(`Could not retrieve vendor information: ${error.message}`);
    }
  }

  /**
   * Fetches customer details from auth service
   */
  private async fetchCustomerDetails(customerId: string) {
    const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/api/users/${customerId}`)
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch customer details: ${error.message}`);
      throw new Error(`Could not retrieve customer information: ${error.message}`);
    }
  }

  /**
   * Sends email notification
   */
  private async sendEmailNotification(email: string, subject: string, body: string) {
    const emailServiceUrl = this.configService.get<string>('EMAIL_SERVICE_URL');
    
    try {
      await firstValueFrom(
        this.httpService.post(`${emailServiceUrl}/api/email/send`, {
          to: email,
          subject,
          html: body,
        })
      );
      this.logger.log(`Email notification sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sends push notification
   */
  private async sendPushNotification(deviceTokens: string[], title: string, body: string) {
    if (!deviceTokens || deviceTokens.length === 0) {
      this.logger.warn('No device tokens provided for push notification');
      return;
    }
    
    const pushServiceUrl = this.configService.get<string>('PUSH_NOTIFICATION_SERVICE_URL');
    
    try {
      await firstValueFrom(
        this.httpService.post(`${pushServiceUrl}/api/push/send`, {
          tokens: deviceTokens,
          title,
          body,
          data: {
            type: 'booking_notification',
          },
        })
      );
      this.logger.log(`Push notification sent successfully to ${deviceTokens.length} devices`);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stores notification in database
   */
  private async storeNotificationInDatabase(event: any, recipientType: 'vendor' | 'customer', recipientId: string) {
    const notificationsServiceUrl = this.configService.get<string>('NOTIFICATIONS_SERVICE_URL');
    
    try {
      await firstValueFrom(
        this.httpService.post(`${notificationsServiceUrl}/api/notifications`, {
          recipientType,
          recipientId,
          type: event.constructor.name,
          title: this.getNotificationTitleByEvent(event),
          message: this.getNotificationMessageByEvent(event),
          metadata: {
            bookingId: event.bookingId,
            serviceType: event.serviceType,
            date: event.date,
            time: event.time,
          },
          isRead: false,
        })
      );
      this.logger.log(`Notification stored in database for ${recipientType} ${recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to store notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets notification title based on event type
   */
  private getNotificationTitleByEvent(event: any): string {
    if (event instanceof BookingCreatedEvent) {
      return 'New Booking Request';
    } else if (event instanceof BookingStatusUpdatedEvent) {
      return `Booking Status: ${event.newStatus}`;
    } else if (event instanceof BookingCancelledEvent) {
      return 'Booking Cancelled';
    }
    return 'Booking Notification';
  }

  /**
   * Gets notification message based on event type
   */
  private getNotificationMessageByEvent(event: any): string {
    if (event instanceof BookingCreatedEvent) {
      return `New booking request for ${event.serviceType} on ${event.date} at ${event.time}`;
    } else if (event instanceof BookingStatusUpdatedEvent) {
      return `Booking status updated to ${event.newStatus} for ${event.serviceType} on ${event.date}`;
    } else if (event instanceof BookingCancelledEvent) {
      return `Booking for ${event.serviceType} on ${event.date} has been cancelled by ${event.cancelledBy}`;
    }
    return 'You have a new booking notification';
  }

  /**
   * Creates HTML email template for new booking notification
   */
  private createNewBookingEmailTemplate(event: BookingCreatedEvent, vendorDetails: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a4a4a; text-align: center;">New Booking Request</h2>
        <p>Hello ${vendorDetails.name},</p>
        <p>You have received a new booking request with the following details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Service:</strong> ${event.serviceType}</p>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Time:</strong> ${event.time}</p>
          <p><strong>Pet Name:</strong> ${event.petName}</p>
          <p><strong>Pet Type:</strong> ${event.petType}</p>
          <p><strong>Special Requests:</strong> ${event.notes || 'None'}</p>
        </div>
        <p>Please log in to your vendor dashboard to accept or manage this booking.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${this.configService.get<string>('VENDOR_DASHBOARD_URL')}/bookings" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Booking
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #757575; text-align: center;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;
  }

  /**
   * Creates HTML email template for booking status updates
   */
  private createStatusUpdateEmailTemplate(event: BookingStatusUpdatedEvent, customerDetails: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a4a4a; text-align: center;">Booking Status Updated</h2>
        <p>Hello ${customerDetails.name},</p>
        <p>Your booking has been updated with the following status: <strong>${event.newStatus}</strong></p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Service:</strong> ${event.serviceType}</p>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Time:</strong> ${event.time}</p>
          <p><strong>Previous Status:</strong> ${event.previousStatus}</p>
          <p><strong>New Status:</strong> ${event.newStatus}</p>
          ${event.notes ? `<p><strong>Additional Notes:</strong> ${event.notes}</p>` : ''}
        </div>
        <p>You can check the details and updates on your booking through our mobile app.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${this.configService.get<string>('MOBILE_APP_URL')}/bookings/${event.bookingId}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Booking Details
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #757575; text-align: center;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;
  }

  /**
   * Creates HTML email template for booking cancellations
   */
  private createCancellationEmailTemplate(
    event: BookingCancelledEvent, 
    recipientDetails: any, 
    recipientType: 'vendor' | 'customer'
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a4a4a; text-align: center;">Booking Cancellation Notice</h2>
        <p>Hello ${recipientDetails.name},</p>
        <p>A booking has been cancelled with the following details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Service:</strong> ${event.serviceType}</p>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Time:</strong> ${event.time}</p>
          <p><strong>Cancelled By:</strong> ${event.cancelledBy === 'customer' ? 'The customer' : 'The service provider'}</p>
          ${event.cancellationReason ? `<p><strong>Reason:</strong> ${event.cancellationReason}</p>` : ''}
        </div>
        ${recipientType === 'customer' 
          ? '<p>We apologize for any inconvenience this may have caused. You can reschedule this booking at your convenience through our mobile app.</p>' 
          : '<p>Please update your availability calendar accordingly.</p>'}
        <div style="text-align: center; margin-top: 30px;">
          <a href="${recipientType === 'customer' 
              ? this.configService.get<string>('MOBILE_APP_URL') + '/bookings'
              : this.configService.get<string>('VENDOR_DASHBOARD_URL') + '/calendar'}" 
            style="background-color: #9C27B0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            ${recipientType === 'customer' ? 'Schedule New Booking' : 'View Calendar'}
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #757575; text-align: center;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;
  }
}
