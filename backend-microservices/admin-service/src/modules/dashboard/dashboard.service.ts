import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AdminUser, AdminStatus } from '../../models/admin-user.model';
import { UserSession } from '../../models/user-session.model';
import { SystemLog, LogLevel } from '../../models/system-log.model';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(AdminUser)
    private adminUserModel: typeof AdminUser,
    @InjectModel(UserSession)
    private userSessionModel: typeof UserSession,
    @InjectModel(SystemLog)
    private systemLogModel: typeof SystemLog,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      todayLogins,
      weeklyLogins,
      monthlyLogins,
      todayLogs,
      errorLogs,
      activeSessions,
    ] = await Promise.all([
      this.adminUserModel.count(),
      this.adminUserModel.count({ where: { status: AdminStatus.ACTIVE } }),
      this.userSessionModel.count({
        where: { createdAt: { [Op.gte]: today } },
      }),
      this.userSessionModel.count({
        where: { createdAt: { [Op.gte]: lastWeek } },
      }),
      this.userSessionModel.count({
        where: { createdAt: { [Op.gte]: lastMonth } },
      }),
      this.systemLogModel.count({
        where: { createdAt: { [Op.gte]: today } },
      }),
      this.systemLogModel.count({
        where: { level: LogLevel.ERROR, createdAt: { [Op.gte]: today } },
      }),
      this.userSessionModel.count({
        where: { isActive: true, expiresAt: { [Op.gt]: now } },
      }),
    ]);

    return {
      userStats: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      loginStats: {
        today: todayLogins,
        thisWeek: weeklyLogins,
        thisMonth: monthlyLogins,
      },
      systemStats: {
        activeSessions,
        todayLogs,
        errorLogs,
      },
    };
  }

  async getRecentActivity(limit = 20) {
    return this.systemLogModel.findAll({
      include: [
        {
          model: AdminUser,
          attributes: ['firstName', 'lastName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });
  }

  async getSystemHealth() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const recentErrors = await this.systemLogModel.count({
      where: {
        level: LogLevel.ERROR,
        createdAt: { [Op.gte]: oneHourAgo },
      },
    });

    const activeSessions = await this.userSessionModel.count({
      where: {
        isActive: true,
        expiresAt: { [Op.gt]: now },
      },
    });

    return {
      status: recentErrors < 10 ? 'healthy' : 'warning',
      recentErrors,
      activeSessions,
      timestamp: now,
    };
  }
}