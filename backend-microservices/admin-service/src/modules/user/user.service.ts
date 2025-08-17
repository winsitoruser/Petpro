import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { AdminUser, AdminStatus, AdminRole } from '../../models/admin-user.model';
import { UserSession } from '../../models/user-session.model';
import { SystemLog, LogLevel, LogCategory } from '../../models/system-log.model';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(AdminUser)
    private adminUserModel: typeof AdminUser,
    @InjectModel(UserSession)
    private userSessionModel: typeof UserSession,
    @InjectModel(SystemLog)
    private systemLogModel: typeof SystemLog,
  ) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: users, count } = await this.adminUserModel.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.adminUserModel.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: UserSession,
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, adminId: string) {
    const user = await this.adminUserModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.update(updateUserDto);

    await this.logActivity({
      userId: adminId,
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `User updated: ${user.email}`,
      metadata: { updatedFields: Object.keys(updateUserDto) },
    });

    return this.findById(id);
  }

  async deactivateUser(id: string, adminId: string) {
    const user = await this.adminUserModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.update({ status: AdminStatus.INACTIVE });

    await this.userSessionModel.update(
      { isActive: false },
      { where: { userId: id } },
    );

    await this.logActivity({
      userId: adminId,
      level: LogLevel.WARNING,
      category: LogCategory.USER_MANAGEMENT,
      message: `User deactivated: ${user.email}`,
    });

    return { message: 'User deactivated successfully' };
  }

  async activateUser(id: string, adminId: string) {
    const user = await this.adminUserModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.update({ status: AdminStatus.ACTIVE });

    await this.logActivity({
      userId: adminId,
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `User activated: ${user.email}`,
    });

    return { message: 'User activated successfully' };
  }

  async getUserSessions(id: string) {
    return this.userSessionModel.findAll({
      where: { userId: id, isActive: true },
      order: [['createdAt', 'DESC']],
    });
  }

  async revokeUserSession(userId: string, sessionId: string, adminId: string) {
    const session = await this.userSessionModel.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await session.update({ isActive: false });

    await this.logActivity({
      userId: adminId,
      level: LogLevel.WARNING,
      category: LogCategory.USER_MANAGEMENT,
      message: `User session revoked for user: ${userId}`,
      metadata: { sessionId },
    });

    return { message: 'Session revoked successfully' };
  }

  private async logActivity(logData: {
    userId?: string;
    level: LogLevel;
    category: LogCategory;
    message: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.systemLogModel.create(logData);
  }
}