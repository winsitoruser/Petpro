import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Booking } from '../models/booking.model';
import { UserIntegrationService } from './user-integration.service';
import { IUser } from '../shared/services/user-client.service';

/**
 * Enhanced Booking Service
 * 
 * SAFE EXAMPLE: Shows how to use new UserClient alongside existing code
 * - No breaking changes to existing Booking model
 * - Enhances functionality with centralized user data
 * - Graceful fallback if user service is unavailable
 */
@Injectable()
export class EnhancedBookingService {
  private readonly logger = new Logger(EnhancedBookingService.name);

  constructor(
    @InjectModel(Booking)
    private readonly bookingModel: typeof Booking,
    private readonly userIntegration: UserIntegrationService,
  ) {}

  /**
   * SAFE: Get booking with enhanced user data
   * 
   * BEFORE: Only had user IDs in booking
   * AFTER: Can get full user details from centralized service
   */
  async getBookingWithUserDetails(bookingId: string) {
    try {
      // Get booking (existing code, no changes)
      const booking = await this.bookingModel.findByPk(bookingId, {
        include: ['service', 'pet']
      });

      if (!booking) {
        return null;
      }

      // ENHANCEMENT: Get user details from centralized service
      const [customer, vendor] = await Promise.all([
        this.userIntegration.getUser(booking.customerId),
        this.userIntegration.getUser(booking.vendorId),
      ]);

      // Return enhanced booking data
      return {
        ...booking.toJSON(),
        customer: customer ? {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          role: customer.role,
        } : null,
        vendor: vendor ? {
          id: vendor.id,
          name: `${vendor.firstName} ${vendor.lastName}`,
          email: vendor.email,
          role: vendor.role,
        } : null,
      };

    } catch (error) {
      this.logger.error(`Failed to get booking with user details: ${error.message}`);
      
      // SAFE FALLBACK: Return basic booking data if user service fails
      const booking = await this.bookingModel.findByPk(bookingId);
      return booking?.toJSON() || null;
    }
  }

  /**
   * SAFE: Get user's bookings with enhanced data
   */
  async getUserBookingsWithDetails(userId: string) {
    try {
      // Get bookings (existing code)
      const bookings = await this.bookingModel.findAll({
        where: {
          customerId: userId
        },
        include: ['service', 'pet'],
        order: [['createdAt', 'DESC']]
      });

      // ENHANCEMENT: Batch get vendor details for all bookings
      const vendorIds = [...new Set(bookings.map(b => b.vendorId))];
      const vendors = await this.userIntegration.getUsers(vendorIds);

      // Return enhanced booking list
      return bookings.map(booking => ({
        ...booking.toJSON(),
        vendor: vendors.has(booking.vendorId) ? {
          id: booking.vendorId,
          name: `${vendors.get(booking.vendorId)!.firstName} ${vendors.get(booking.vendorId)!.lastName}`,
          email: vendors.get(booking.vendorId)!.email,
          role: vendors.get(booking.vendorId)!.role,
        } : null,
      }));

    } catch (error) {
      this.logger.error(`Failed to get user bookings with details: ${error.message}`);
      
      // SAFE FALLBACK: Return basic booking data
      const bookings = await this.bookingModel.findAll({
        where: { customerId: userId },
        order: [['createdAt', 'DESC']]
      });
      
      return bookings.map(b => b.toJSON());
    }
  }

  /**
   * SAFE: Create booking with user validation
   */
  async createBookingWithValidation(bookingData: any) {
    try {
      // ENHANCEMENT: Validate users exist before creating booking
      const [customerExists, vendorExists] = await Promise.all([
        this.userIntegration.userExists(bookingData.customerId),
        this.userIntegration.userExists(bookingData.vendorId),
      ]);

      if (!customerExists) {
        throw new Error(`Customer ${bookingData.customerId} not found`);
      }

      if (!vendorExists) {
        throw new Error(`Vendor ${bookingData.vendorId} not found`);
      }

      // Create booking (existing code)
      const booking = await this.bookingModel.create(bookingData);
      
      this.logger.log(`Created booking ${booking.id} for customer ${bookingData.customerId}`);
      return booking;

    } catch (error) {
      this.logger.error(`Failed to create booking: ${error.message}`);
      throw error;
    }
  }

  /**
   * SAFE: Search bookings with user name filtering
   */
  async searchBookingsWithUserNames(searchTerm: string) {
    try {
      // Get all bookings first (existing approach)
      const bookings = await this.bookingModel.findAll({
        include: ['service', 'pet'],
        order: [['createdAt', 'DESC']],
        limit: 100 // Limit for performance
      });

      if (!searchTerm || searchTerm.trim() === '') {
        return bookings.map(b => b.toJSON());
      }

      // ENHANCEMENT: Filter by user names using centralized user data
      const userIds = [...new Set([
        ...bookings.map(b => b.customerId),
        ...bookings.map(b => b.vendorId)
      ])];

      const users = await this.userIntegration.getUsers(userIds);
      const searchLower = searchTerm.toLowerCase();

      // Filter bookings by user names
      const filteredBookings = bookings.filter(booking => {
        const customer = users.get(booking.customerId);
        const vendor = users.get(booking.vendorId);
        
        const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
        const vendorName = vendor ? `${vendor.firstName} ${vendor.lastName}`.toLowerCase() : '';
        
        return customerName.includes(searchLower) || 
               vendorName.includes(searchLower);
      });

      return filteredBookings.map(booking => ({
        ...booking.toJSON(),
        customer: users.has(booking.customerId) ? {
          name: `${users.get(booking.customerId)!.firstName} ${users.get(booking.customerId)!.lastName}`,
        } : null,
        vendor: users.has(booking.vendorId) ? {
          name: `${users.get(booking.vendorId)!.firstName} ${users.get(booking.vendorId)!.lastName}`,
        } : null,
      }));

    } catch (error) {
      this.logger.error(`Failed to search bookings: ${error.message}`);
      
      // SAFE FALLBACK: Return basic search
      const bookings = await this.bookingModel.findAll({
        limit: 50,
        order: [['createdAt', 'DESC']]
      });
      
      return bookings.map(b => b.toJSON());
    }
  }
}