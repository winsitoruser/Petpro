/**
 * Authentication Database Service
 * 
 * Manages user authentication, sessions, password resets, and security operations.
 */
import { User, LoginAttempt, RefreshToken, PasswordReset } from '@prisma/client';
import BaseService from './baseService';
import { v4 as uuidv4 } from 'uuid';

export default class AuthService extends BaseService<User> {
  constructor() {
    super('user');
  }

  /**
   * Find user by email for authentication
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Log a login attempt
   */
  async logLoginAttempt(
    data: {
      userId?: string;
      email: string;
      success: boolean;
      ipAddress?: string;
      userAgent?: string;
      failureReason?: string;
    }
  ): Promise<LoginAttempt> {
    return this.prisma.loginAttempt.create({
      data,
    });
  }

  /**
   * Create a refresh token
   */
  async createRefreshToken(
    userId: string,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      expiresAt?: Date;
    }
  ): Promise<RefreshToken> {
    // Set expiry date if not provided (default 30 days)
    const expiresAt = options?.expiresAt || new Date();
    if (!options?.expiresAt) {
      expiresAt.setDate(expiresAt.getDate() + 30);
    }
    
    return this.prisma.refreshToken.create({
      data: {
        token: uuidv4(),
        userId,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        expiresAt,
      },
    });
  }

  /**
   * Validate a refresh token
   */
  async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
        revokedAt: null,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(
    token: string,
    options?: {
      reason?: string;
    }
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: {
        token,
      },
      data: {
        revokedAt: new Date(),
        revocationReason: options?.reason,
      },
    });
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(
    userId: string,
    options?: {
      reason?: string;
      exceptTokenId?: string;
    }
  ): Promise<number> {
    const where: any = {
      userId,
      revokedAt: null,
    };
    
    if (options?.exceptTokenId) {
      where.id = { not: options.exceptTokenId };
    }
    
    const result = await this.prisma.refreshToken.updateMany({
      where,
      data: {
        revokedAt: new Date(),
        revocationReason: options?.reason || 'User logout or security action',
      },
    });
    
    return result.count;
  }

  /**
   * Create a password reset token
   */
  async createPasswordReset(
    email: string,
    options?: {
      ipAddress?: string;
      expiryHours?: number;
    }
  ): Promise<PasswordReset | null> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (!user) {
      return null;
    }
    
    // Set expiry date (default 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (options?.expiryHours || 24));
    
    // Create reset token
    return this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: uuidv4(),
        ipAddress: options?.ipAddress,
        expiresAt,
      },
    });
  }

  /**
   * Validate a password reset token
   */
  async validatePasswordResetToken(token: string): Promise<PasswordReset | null> {
    return this.prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Complete password reset
   */
  async completePasswordReset(
    token: string,
    hashedPassword: string
  ): Promise<User | null> {
    // Find valid token
    const resetToken = await this.validatePasswordResetToken(token);
    
    if (!resetToken) {
      return null;
    }
    
    // Use transaction to update both token and user
    return this.prisma.$transaction(async (tx) => {
      // Mark token as used
      await tx.passwordReset.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
      
      // Update user password
      const updatedUser = await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
      });
      
      // Revoke all existing tokens for security
      await tx.refreshToken.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: {
          revokedAt: new Date(),
          revocationReason: 'Password reset',
        },
      });
      
      return updatedUser;
    });
  }

  /**
   * Get login history for a user
   */
  async getUserLoginHistory(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      successOnly?: boolean;
    }
  ): Promise<LoginAttempt[]> {
    const where: any = { userId };
    
    if (options?.successOnly !== undefined) {
      where.success = options.successOnly;
    }
    
    return this.prisma.loginAttempt.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(userId: string): Promise<RefreshToken[]> {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Record security event
   */
  async recordSecurityEvent(
    data: {
      userId: string;
      eventType: string;
      description: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: any;
    }
  ) {
    return this.prisma.securityEvent.create({
      data: {
        userId: data.userId,
        eventType: data.eventType,
        description: data.description,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        lockedUntil: true,
        accountStatus: true,
      },
    });
    
    if (!user) {
      return false;
    }
    
    // Check if account is explicitly locked
    if (user.accountStatus === 'LOCKED') {
      return true;
    }
    
    // Check if temporary lock is active
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return true;
    }
    
    return false;
  }

  /**
   * Handle failed login attempt lockout
   */
  async handleFailedLoginAttempt(
    email: string,
    options?: {
      ipAddress?: string;
      maxAttempts?: number;
      lockoutDurationMinutes?: number;
    }
  ): Promise<boolean> {
    const maxAttempts = options?.maxAttempts || 5;
    const lockoutDuration = options?.lockoutDurationMinutes || 30;
    
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    if (!user) {
      return false;
    }
    
    // Count recent failed attempts
    const recentFailedAttemptWindow = new Date();
    recentFailedAttemptWindow.setMinutes(recentFailedAttemptWindow.getMinutes() - 60);
    
    const recentFailedAttempts = await this.prisma.loginAttempt.count({
      where: {
        email: email.toLowerCase(),
        success: false,
        createdAt: {
          gte: recentFailedAttemptWindow,
        },
      },
    });
    
    // If exceeds threshold, lock account temporarily
    if (recentFailedAttempts >= maxAttempts) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + lockoutDuration);
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: lockUntil,
        },
      });
      
      // Record security event
      await this.recordSecurityEvent({
        userId: user.id,
        eventType: 'ACCOUNT_LOCKED',
        description: `Account temporarily locked for ${lockoutDuration} minutes due to ${recentFailedAttempts} failed login attempts`,
        ipAddress: options?.ipAddress,
      });
      
      return true;
    }
    
    return false;
  }
}
