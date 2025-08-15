import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../models/user.model';
import { LoggerService } from '../../common/logger/logger.service';
import { EventsService } from '../../events/events.service';
import { Op } from 'sequelize';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly logger: LoggerService,
    private readonly eventsService: EventsService,
  ) {}

  async findAll(page = 1, limit = 10, role?: string): Promise<{ users: User[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    const where = role ? { role } : {};

    const { count, rows } = await this.userModel.findAndCountAll({
      where,
      limit,
      offset,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    return {
      users: rows,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`, 'UserService');
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email },
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return null;
    }

    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    // Find the user
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        where: { email: updateData.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    try {
      // Remove sensitive fields from update data
      const { password, ...safeUpdateData } = updateData;

      // Update user
      await user.update(safeUpdateData);

      // Publish user updated event
      this.eventsService.publishUserUpdated({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });

      return this.findById(id); // Return updated user without sensitive data
    } catch (error) {
      this.logger.error(`Failed to update user ${id}`, error, 'UserService');
      throw new BadRequestException('Failed to update user');
    }
  }

  async deactivate(id: string): Promise<boolean> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      await user.update({ active: false });
      return true;
    } catch (error) {
      this.logger.error(`Failed to deactivate user ${id}`, error, 'UserService');
      throw new BadRequestException('Failed to deactivate user');
    }
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      // Don't reveal user existence, but don't proceed either
      return true;
    }

    try {
      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set expiry to 30 minutes from now
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 30);

      // Update user with reset token
      await user.update({
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: expiryDate,
      });

      // Publish password reset requested event
      this.eventsService.publishPasswordResetRequested(user.id);

      // Return original token (not hashed) to send via email
      return true;
    } catch (error) {
      this.logger.error(`Failed to request password reset for user with email ${email}`, error, 'UserService');
      throw new BadRequestException('Failed to process password reset request');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token
    const user = await this.userModel.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetTokenExpiry: {
          [Op.gt]: new Date(), // Token expiry must be greater than current time
        },
        active: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    try {
      // Update password and clear reset token fields
      await user.update({
        password: newPassword, // Will be hashed by model hooks
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to reset password', error, 'UserService');
      throw new BadRequestException('Failed to reset password');
    }
  }

  async search(query: string, page = 1, limit = 10): Promise<{ users: User[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await this.userModel.findAndCountAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit,
      offset,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    return {
      users: rows,
      total: count,
      pages: Math.ceil(count / limit),
    };
  }
}
