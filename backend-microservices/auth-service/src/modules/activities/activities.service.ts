import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Activity, ActivityType } from './models/activity.model';
import { User } from '../users/models/user.model';
import { Op } from 'sequelize';
import { CreateActivityDto } from './dto/create-activity.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity)
    private activityModel: typeof Activity,
    @InjectModel(User)
    private userModel: typeof User,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new activity record
   */
  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = await this.activityModel.create({
      ...createActivityDto,
    });

    // Emit event for real-time updates
    this.eventEmitter.emit('activity.created', activity);
    
    return activity;
  }

  /**
   * Track user login activity
   */
  async trackLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<Activity> {
    const user = await this.userModel.findByPk(userId);
    
    return this.create({
      userId,
      type: ActivityType.LOGIN,
      description: `${user.email} logged in`,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Track user logout activity
   */
  async trackLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<Activity> {
    const user = await this.userModel.findByPk(userId);
    
    return this.create({
      userId,
      type: ActivityType.LOGOUT,
      description: `${user.email} logged out`,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Track profile update activity
   */
  async trackProfileUpdate(
    userId: string,
    changes: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Activity> {
    const user = await this.userModel.findByPk(userId);
    
    return this.create({
      userId,
      type: ActivityType.PROFILE_UPDATE,
      description: `${user.email} updated their profile`,
      metadata: { changes },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Track password change activity
   */
  async trackPasswordChange(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Activity> {
    const user = await this.userModel.findByPk(userId);
    
    return this.create({
      userId,
      type: ActivityType.PASSWORD_CHANGED,
      description: `${user.email} changed their password`,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Track booking activity
   */
  async trackBooking(
    userId: string,
    bookingId: string,
    action: 'created' | 'updated' | 'cancelled',
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Activity> {
    const user = await this.userModel.findByPk(userId);
    let type: ActivityType;
    
    switch (action) {
      case 'created':
        type = ActivityType.BOOKING_CREATED;
        break;
      case 'updated':
        type = ActivityType.BOOKING_UPDATED;
        break;
      case 'cancelled':
        type = ActivityType.BOOKING_CANCELLED;
        break;
    }
    
    return this.create({
      userId,
      type,
      description: `${user.email} ${action} booking #${bookingId}`,
      metadata: { bookingId, ...details },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Track payment activity
   */
  async trackPayment(
    userId: string,
    paymentId: string,
    action: 'made' | 'refunded',
    amount: number,
    currency: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Activity> {
    const user = await this.userModel.findByPk(userId);
    const type = action === 'made' ? ActivityType.PAYMENT_MADE : ActivityType.PAYMENT_REFUNDED;
    
    return this.create({
      userId,
      type,
      description: `${user.email} ${action} payment of ${amount} ${currency}`,
      metadata: { 
        paymentId, 
        amount, 
        currency,
        ...details 
      },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Track pet activity
   */
  async trackPetActivity(
    userId: string,
    petId: string,
    action: 'created' | 'updated' | 'removed',
    petDetails: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Activity> {
    const user = await this.userModel.findByPk(userId);
    let type: ActivityType;
    
    switch (action) {
      case 'created':
        type = ActivityType.PET_CREATED;
        break;
      case 'updated':
        type = ActivityType.PET_UPDATED;
        break;
      case 'removed':
        type = ActivityType.PET_REMOVED;
        break;
    }
    
    return this.create({
      userId,
      type,
      description: `${user.email} ${action} pet ${petDetails.name}`,
      metadata: { petId, ...petDetails },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Track review submission
   */
  async trackReviewSubmission(
    userId: string,
    reviewId: string,
    targetType: string,
    targetId: string,
    rating: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Activity> {
    const user = await this.userModel.findByPk(userId);
    
    return this.create({
      userId,
      type: ActivityType.REVIEW_SUBMITTED,
      description: `${user.email} submitted a ${rating}-star review`,
      metadata: { 
        reviewId, 
        targetType, 
        targetId, 
        rating 
      },
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Get activities by user ID with pagination and filtering
   */
  async getActivitiesByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
    types?: ActivityType[],
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ activities: Activity[]; total: number }> {
    const whereClause: any = { userId };
    
    if (types && types.length > 0) {
      whereClause.type = {
        [Op.in]: types,
      };
    }
    
    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereClause.timestamp = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      whereClause.timestamp = {
        [Op.lte]: endDate,
      };
    }
    
    const { count, rows } = await this.activityModel.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'email', 'firstName', 'lastName'],
      }],
      order: [['timestamp', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
    
    return {
      activities: rows,
      total: count,
    };
  }

  /**
   * Get recent activities across all users with pagination and filtering
   * Admin only function
   */
  async getRecentActivities(
    page: number = 1,
    limit: number = 10,
    types?: ActivityType[],
    startDate?: Date,
    endDate?: Date,
    userId?: string,
  ): Promise<{ activities: Activity[]; total: number }> {
    const whereClause: any = {};
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (types && types.length > 0) {
      whereClause.type = {
        [Op.in]: types,
      };
    }
    
    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereClause.timestamp = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      whereClause.timestamp = {
        [Op.lte]: endDate,
      };
    }
    
    const { count, rows } = await this.activityModel.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'email', 'firstName', 'lastName'],
      }],
      order: [['timestamp', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });
    
    return {
      activities: rows,
      total: count,
    };
  }

  /**
   * Get activity statistics by day, week or month
   */
  async getActivityStatistics(
    groupBy: 'day' | 'week' | 'month' = 'day',
    startDate?: Date,
    endDate?: Date,
  ) {
    const whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereClause.timestamp = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      whereClause.timestamp = {
        [Op.lte]: endDate,
      };
    }
    
    let timePeriod: string;
    
    switch (groupBy) {
      case 'day':
        timePeriod = 'YYYY-MM-DD';
        break;
      case 'week':
        timePeriod = 'YYYY-WW';
        break;
      case 'month':
        timePeriod = 'YYYY-MM';
        break;
    }
    
    const statistics = await this.activityModel.findAll({
      attributes: [
        [this.activityModel.sequelize.fn('date_trunc', groupBy, this.activityModel.sequelize.col('timestamp')), 'period'],
        'type',
        [this.activityModel.sequelize.fn('count', '*'), 'count']
      ],
      where: whereClause,
      group: [
        this.activityModel.sequelize.fn('date_trunc', groupBy, this.activityModel.sequelize.col('timestamp')),
        'type'
      ],
      order: [
        [this.activityModel.sequelize.literal('period'), 'ASC'],
        ['type', 'ASC']
      ],
    });
    
    return statistics;
  }
}
