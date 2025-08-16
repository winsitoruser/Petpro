import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../users/models/user.model';
import { Activity } from '../activities/models/activity.model';
import { Pet } from '../pets/models/pet.model';
import { Op } from 'sequelize';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Activity)
    private activityModel: typeof Activity,
    @InjectModel(Pet)
    private petModel: typeof Pet,
    private sequelize: Sequelize,
  ) {}

  /**
   * Get customer growth analytics (new customers per period)
   */
  async getCustomerGrowthStats(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day',
  ) {
    const dateFormat = {
      day: 'YYYY-MM-DD',
      week: 'YYYY-WW',
      month: 'YYYY-MM',
    };

    const result = await this.userModel.findAll({
      attributes: [
        [
          this.sequelize.fn(
            'date_trunc',
            interval,
            this.sequelize.col('created_at'),
          ),
          'date',
        ],
        [this.sequelize.fn('count', this.sequelize.col('id')), 'count'],
      ],
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
        role: 'customer',
      },
      group: [this.sequelize.fn('date_trunc', interval, this.sequelize.col('created_at'))],
      order: [[this.sequelize.literal('date'), 'ASC']],
      raw: true,
    });

    return result;
  }

  /**
   * Get customer activity statistics
   */
  async getCustomerActivityStats(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month' = 'day',
  ) {
    const result = await this.activityModel.findAll({
      attributes: [
        [
          this.sequelize.fn(
            'date_trunc',
            interval,
            this.sequelize.col('timestamp'),
          ),
          'date',
        ],
        ['type', 'activity_type'],
        [this.sequelize.fn('count', this.sequelize.col('id')), 'count'],
      ],
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [
        this.sequelize.fn('date_trunc', interval, this.sequelize.col('timestamp')),
        'type',
      ],
      order: [[this.sequelize.literal('date'), 'ASC']],
      raw: true,
    });

    return result;
  }

  /**
   * Get customer demographics data
   */
  async getCustomerDemographics() {
    // Get pet type distribution
    const petTypesData = await this.petModel.findAll({
      attributes: [
        'type',
        [this.sequelize.fn('count', this.sequelize.col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });

    // Get user registration data by month
    const registrationByMonth = await this.userModel.findAll({
      attributes: [
        [
          this.sequelize.fn(
            'date_trunc',
            'month',
            this.sequelize.col('created_at'),
          ),
          'month',
        ],
        [this.sequelize.fn('count', this.sequelize.col('id')), 'count'],
      ],
      where: {
        role: 'customer',
      },
      group: [
        this.sequelize.fn('date_trunc', 'month', this.sequelize.col('created_at')),
      ],
      order: [[this.sequelize.literal('month'), 'ASC']],
      limit: 12,
      raw: true,
    });

    // Get top active users
    const topActiveUsers = await this.activityModel.findAll({
      attributes: [
        'userId',
        [this.sequelize.fn('count', this.sequelize.col('id')), 'activity_count'],
      ],
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      group: ['userId', 'user.id', 'user.firstName', 'user.lastName', 'user.email'],
      order: [[this.sequelize.literal('activity_count'), 'DESC']],
      limit: 10,
    });

    return {
      petTypesData,
      registrationByMonth,
      topActiveUsers,
    };
  }

  /**
   * Get booking and service usage metrics
   */
  async getServiceUsageMetrics(startDate: Date, endDate: Date) {
    // Service bookings by type
    const bookingsByType = await this.activityModel.findAll({
      attributes: [
        [
          this.sequelize.fn('json_extract_path_text', 
            this.sequelize.col('metadata'), 
            'serviceType'
          ),
          'service_type',
        ],
        [this.sequelize.fn('count', this.sequelize.col('id')), 'count'],
      ],
      where: {
        type: 'booking_created',
        timestamp: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [this.sequelize.literal('service_type')],
      raw: true,
    });

    // Monthly revenue from bookings (estimated from payment_made activities)
    const monthlyRevenue = await this.activityModel.findAll({
      attributes: [
        [
          this.sequelize.fn(
            'date_trunc',
            'month',
            this.sequelize.col('timestamp'),
          ),
          'month',
        ],
        [
          this.sequelize.fn('sum', 
            this.sequelize.fn('cast', 
              this.sequelize.fn('json_extract_path_text', 
                this.sequelize.col('metadata'), 
                'amount'
              ),
              'numeric'
            )
          ),
          'total_amount',
        ],
      ],
      where: {
        type: 'payment_made',
        timestamp: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [
        this.sequelize.fn('date_trunc', 'month', this.sequelize.col('timestamp')),
      ],
      order: [[this.sequelize.literal('month'), 'ASC']],
      raw: true,
    });

    return {
      bookingsByType,
      monthlyRevenue,
    };
  }

  /**
   * Get customer retention metrics
   */
  async getCustomerRetentionMetrics() {
    // Get customers with repeat bookings
    const customersWithMultipleBookings = await this.sequelize.query(`
      SELECT 
        u.id, 
        u.email,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT a.id) as booking_count
      FROM 
        users u
      JOIN 
        activities a ON u.id = a.user_id
      WHERE 
        a.type = 'booking_created'
      GROUP BY 
        u.id, u.email, u.first_name, u.last_name
      HAVING 
        COUNT(DISTINCT a.id) > 1
      ORDER BY 
        booking_count DESC
      LIMIT 50
    `, { type: this.sequelize.QueryTypes.SELECT });

    // Get customer retention rate by calculating customers who made bookings in consecutive months
    const retentionByMonth = await this.sequelize.query(`
      WITH monthly_active_users AS (
        SELECT 
          u.id as user_id,
          date_trunc('month', a.timestamp) as month
        FROM 
          users u
        JOIN 
          activities a ON u.id = a.user_id
        WHERE 
          a.type IN ('booking_created', 'payment_made')
        GROUP BY 
          u.id, date_trunc('month', a.timestamp)
      ),
      retention_data AS (
        SELECT
          current_month.month,
          COUNT(DISTINCT current_month.user_id) as total_users,
          COUNT(DISTINCT next_month.user_id) as retained_users
        FROM
          monthly_active_users current_month
        LEFT JOIN
          monthly_active_users next_month 
          ON current_month.user_id = next_month.user_id 
          AND next_month.month = (current_month.month + interval '1 month')
        GROUP BY
          current_month.month
        ORDER BY
          current_month.month
      )
      SELECT
        month,
        total_users,
        retained_users,
        CASE 
          WHEN total_users > 0 THEN ROUND((retained_users::numeric / total_users) * 100, 2)
          ELSE 0
        END as retention_rate
      FROM
        retention_data
      WHERE
        month < date_trunc('month', CURRENT_DATE)
      ORDER BY
        month DESC
      LIMIT 12
    `, { type: this.sequelize.QueryTypes.SELECT });

    return {
      customersWithMultipleBookings,
      retentionByMonth,
    };
  }
}
