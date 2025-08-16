import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Activity } from './models/activity.model';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityType } from './enums/activity-type.enum';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectModel(Activity)
    private activityModel: typeof Activity,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new activity record
   */
  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    this.logger.log(`Creating activity for user ${createActivityDto.userId}: ${createActivityDto.type}`);
    
    try {
      const activity = await this.activityModel.create({
        ...createActivityDto,
        timestamp: new Date(),
      });
      
      // Emit event for real-time notifications
      this.eventEmitter.emit('user.activity.created', {
        activityId: activity.id,
        userId: activity.userId,
        type: activity.type,
        timestamp: activity.timestamp,
      });
      
      return activity;
    } catch (error) {
      this.logger.error(`Failed to create activity: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track login activity
   */
  async trackLogin(userId: string, ipAddress: string, userAgent: string): Promise<Activity> {
    return this.create({
      userId,
      type: ActivityType.LOGIN,
      description: 'User logged in',
      ipAddress,
      userAgent,
      metadata: { loginMethod: 'email' },
    });
  }

  /**
   * Track profile update activity
   */
  async trackProfileUpdate(
    userId: string, 
    updatedFields: string[], 
    ipAddress: string,
    userAgent: string,
  ): Promise<Activity> {
    return this.create({
      userId,
      type: ActivityType.PROFILE_UPDATE,
      description: `User updated profile fields: ${updatedFields.join(', ')}`,
      ipAddress,
      userAgent,
      metadata: { updatedFields },
    });
  }

  /**
   * Track booking activity
   */
  async trackBooking(
    userId: string, 
    bookingId: string,
    serviceType: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<Activity> {
    return this.create({
      userId,
      type: ActivityType.BOOKING_CREATED,
      description: `User created a new ${serviceType} booking`,
      ipAddress,
      userAgent,
      metadata: { bookingId, serviceType },
    });
  }

  /**
   * Track review activity
   */
  async trackReview(
    userId: string,
    reviewId: string,
    vendorId: string,
    rating: number,
    ipAddress: string,
    userAgent: string,
  ): Promise<Activity> {
    return this.create({
      userId,
      type: ActivityType.REVIEW_SUBMITTED,
      description: `User submitted a ${rating}-star review`,
      ipAddress,
      userAgent,
      metadata: { reviewId, vendorId, rating },
    });
  }

  /**
   * Track password change activity
   */
  async trackPasswordChange(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<Activity> {
    return this.create({
      userId,
      type: ActivityType.PASSWORD_CHANGED,
      description: 'User changed password',
      ipAddress,
      userAgent,
      metadata: {},
    });
  }

  /**
   * Track pet creation activity
   */
  async trackPetCreated(
    userId: string,
    petId: string,
    petName: string,
    petType: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<Activity> {
    return this.create({
      userId,
      type: ActivityType.PET_CREATED,
      description: `User added a new pet: ${petName} (${petType})`,
      ipAddress,
      userAgent,
      metadata: { petId, petName, petType },
    });
  }

  /**
   * Track payment activity
   */
  async trackPayment(
    userId: string,
    paymentId: string,
    amount: number,
    currency: string,
    bookingId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<Activity> {
    return this.create({
      userId,
      type: ActivityType.PAYMENT_MADE,
      description: `User made a payment of ${amount} ${currency}`,
      ipAddress,
      userAgent,
      metadata: { paymentId, amount, currency, bookingId },
    });
  }

  /**
   * Get activities for a specific user
   */
  async findByUserId(
    userId: string,
    page = 1,
    limit = 20,
    startDate?: Date,
    endDate?: Date,
    types?: ActivityType[],
  ): Promise<{ activities: Activity[]; total: number }> {
    this.logger.log(`Getting activities for user ${userId}`);
    
    const where: any = { userId };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = startDate;
      if (endDate) where.timestamp[Op.lte] = endDate;
    }
    
    // Add activity types filter if provided
    if (types && types.length > 0) {
      where.type = { [Op.in]: types };
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    const { count, rows } = await this.activityModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['timestamp', 'DESC']],
    });
    
    return {
      activities: rows,
      total: count,
    };
  }

  /**
   * Get recent activities across all users (for admin)
   */
  async findRecent(
    page = 1,
    limit = 50,
    startDate?: Date,
    endDate?: Date,
    types?: ActivityType[],
    userId?: string,
  ): Promise<{ activities: Activity[]; total: number }> {
    this.logger.log('Getting recent activities');
    
    const where: any = {};
    
    // Add date range filter if provided
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = startDate;
      if (endDate) where.timestamp[Op.lte] = endDate;
    }
    
    // Add activity types filter if provided
    if (types && types.length > 0) {
      where.type = { [Op.in]: types };
    }
    
    // Add user filter if provided
    if (userId) {
      where.userId = userId;
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    const { count, rows } = await this.activityModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['timestamp', 'DESC']],
    });
    
    return {
      activities: rows,
      total: count,
    };
  }

  /**
   * Get activity statistics for analytics
   */
  async getActivityStatistics(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ): Promise<any[]> {
    this.logger.log(`Getting activity statistics from ${startDate} to ${endDate}`);
    
    // This implementation would depend on the database being used
    // Here's a placeholder that would need to be adapted for the actual DB
    const statistics = await this.activityModel.sequelize.query(`
      SELECT 
        DATE_TRUNC('${groupBy}', timestamp) as period,
        type,
        COUNT(*) as count
      FROM activities
      WHERE timestamp BETWEEN :startDate AND :endDate
      GROUP BY period, type
      ORDER BY period, type
    `, {
      replacements: { startDate, endDate },
      type: 'SELECT',
    });
    
    return statistics;
  }
}
