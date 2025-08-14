/**
 * User Database Service
 * 
 * Handles all database operations related to users, profiles, and role management.
 */
import { Prisma, User, UserProfile } from '@prisma/client';
import BaseService from './baseService';
import { UserType } from '../../types/models';

export default class UserService extends BaseService<User> {
  constructor() {
    super('user');
    this.searchFields = ['email', 'profile.firstName', 'profile.lastName', 'profile.displayName'];
    this.defaultInclude = {
      profile: true,
      roles: {
        include: {
          role: true,
        },
      },
    };
  }

  /**
   * Create a new user with associated profile
   */
  async createUser(userData: {
    email: string;
    passwordHash?: string;
    userType?: UserType;
    emailVerified?: boolean;
    phone?: string;
    phoneVerified?: boolean;
    profile?: {
      firstName?: string;
      lastName?: string;
      displayName?: string;
      profilePictureUrl?: string;
      bio?: string;
      preferences?: Record<string, any>;
    };
  }): Promise<User> {
    const { profile, ...userDataWithoutProfile } = userData;

    // Set default values if not provided
    const userDataWithDefaults = {
      ...userDataWithoutProfile,
      userType: userData.userType || UserType.CUSTOMER,
      emailVerified: userData.emailVerified || false,
      phoneVerified: userData.phoneVerified || false,
    };

    return this.prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          ...userDataWithDefaults,
          profile: profile ? {
            create: {
              firstName: profile.firstName,
              lastName: profile.lastName,
              displayName: profile.displayName,
              profilePictureUrl: profile.profilePictureUrl,
              bio: profile.bio,
              preferences: profile.preferences || {},
            },
          } : undefined,
        },
        include: this.defaultInclude,
      });

      return user;
    });
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: this.defaultInclude,
    });
  }

  /**
   * Find users by type
   */
  async findByType(userType: UserType, options?: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { 
        userType,
        deletedAt: null,
      },
      include: this.defaultInclude,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    // First check if profile exists
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      return this.prisma.userProfile.create({
        data: {
          ...profileData,
          userId,
          preferences: profileData.preferences || {},
        },
      });
    } else {
      // Update existing profile
      return this.prisma.userProfile.update({
        where: { userId },
        data: profileData,
      });
    }
  }

  /**
   * Assign roles to a user
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Create connections for each role
      for (const roleId of roleIds) {
        await tx.userRole.upsert({
          where: {
            userId_roleId: {
              userId,
              roleId,
            },
          },
          update: {},
          create: {
            userId,
            roleId,
          },
        });
      }
    });
  }

  /**
   * Remove roles from a user
   */
  async removeRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: {
        userId,
        roleId: {
          in: roleIds,
        },
      },
    });
  }

  /**
   * Get all roles for a user including permissions
   */
  async getUserRolesAndPermissions(userId: string): Promise<{
    roles: any[];
    permissions: any[];
  }> {
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: userId },
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

    if (!userWithRoles) {
      return { roles: [], permissions: [] };
    }

    const roles = userWithRoles.roles.map(ur => ur.role);
    
    // Extract unique permissions from all roles
    const permissionsMap = new Map();
    
    roles.forEach(role => {
      role.permissions.forEach(rp => {
        const permission = rp.permission;
        permissionsMap.set(permission.id, permission);
      });
    });
    
    const permissions = Array.from(permissionsMap.values());

    return { roles, permissions };
  }

  /**
   * Soft delete a user
   */
  async softDeleteUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        deletedAt: new Date(),
        active: false,
      },
    });
  }

  /**
   * Reactivate a soft-deleted user
   */
  async reactivateUser(userId: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { 
        deletedAt: null,
        active: true,
      },
    });
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Create a refresh token for a user
   */
  async createRefreshToken(userId: string, token: string, expiresInDays: number = 30): Promise<any> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        revoked: false,
      },
    });
  }

  /**
   * Get valid refresh token
   */
  async getValidRefreshToken(token: string): Promise<any | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        token,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revoked: false,
      },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  }
}
