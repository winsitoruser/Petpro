/**
 * User Repository
 * 
 * Repository for user management operations with specialized methods
 * for user-specific queries and transactions.
 */
import { PrismaClient } from '@prisma/client';
import type { User, UserProfile } from '@prisma/client';
import { UserType } from '../../../types/userTypes';
import * as PrismaNamespace from '@prisma/client/runtime/library';

type Prisma = typeof PrismaNamespace;
import { EnhancedRepository } from './enhancedRepository';
import { logger } from '../../../utils/logger';

// Type for user creation with profile
interface CreateUserWithProfileData {
  email: string;
  passwordHash?: string;
  userType: UserType;
  profile?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profileImage?: string;
    bio?: string;
  };
}

// Type for user search options
interface UserSearchOptions {
  searchTerm?: string;
  userType?: UserType;
  active?: boolean;
  verified?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export class UserRepository extends EnhancedRepository<User> {
  // Repository name for metrics and logging
  protected readonly repositoryName = 'UserRepository';
  
  // Model name for metrics and logging
  protected readonly modelName = 'User';
  
  // Cache TTL
  private readonly cacheTtl = 300; // 5 minutes
  
  constructor() {
    super();
  }

  /**
   * Find a user by email with optional profile inclusion
   */
  async findByEmail(
    email: string,
    includeProfile: boolean = false
  ): Promise<User | null> {
    const method = 'findByEmail';
    const cacheKey = `user:email:${email}:${includeProfile}`;
    
    return this.getFromCacheOrDb(cacheKey, method, async () => {
      return this.executeQuery('findFirst', method, async () => {
        const include = includeProfile ? { profile: true } : undefined;
        return await this.prisma.user.findFirst({
          where: { email, deletedAt: null },
          include
        });
      });
    }, this.cacheTtl);
  }

  /**
   * Create a user with optional profile in a single transaction
   */
  async createWithProfile(data: CreateUserWithProfileData): Promise<User> {
    const method = 'createWithProfile';
    
    return this.executeTransaction(async () => {
      const user = await this.executeQuery('create', method, async () => {
        return await this.prisma.user.create({
          data: {
            email: data.email,
            passwordHash: data.passwordHash,
            userType: data.userType,
            // Create profile if provided
            profile: data.profile ? {
              create: data.profile
            } : undefined
          },
          include: {
            profile: true
          }
        });
      });
      
      logger.info('Created user with profile', { 
        userId: user.id,
        email: user.email,
        userType: user.userType 
      });
      
      // Invalidate any existing cache for this user
      await this.invalidateCache(`user:email:${user.email}:*`, method);
      
      return user;
    });
  }

  /**
   * Update user and profile in a single transaction
   */
  async updateWithProfile(
    userId: string,
    userData: Partial<User>,
    profileData?: Partial<UserProfile>
  ): Promise<User> {
    const method = 'updateWithProfile';
    
    return this.executeTransaction(async () => {
      const user = await this.executeQuery('update', method, async () => {
        return await this.prisma.user.update({
          where: { id: userId },
          data: {
            ...userData,
            // Update profile if provided
            profile: profileData ? {
              upsert: {
                create: { ...profileData },
                update: { ...profileData }
              }
            } : undefined
          },
          include: {
            profile: true
          }
        });
      });
      
      // Invalidate cache for this user
      await this.invalidateCache(`user:id:${userId}:*`, method);
      if (user.email) {
        await this.invalidateCache(`user:email:${user.email}:*`, method);
      }
      
      return user;
    });
  }

  /**
   * Advanced user search with filtering, sorting and pagination
   */
  async searchUsers(options: UserSearchOptions): Promise<{ users: User[]; total: number }> {
    const method = 'searchUsers';
    const { 
      searchTerm, 
      userType, 
      active, 
      verified, 
      sortBy = 'createdAt',
      sortDirection = 'desc',
      page = 1,
      pageSize = 10
    } = options;

    // Build a cache key from search options
    const cacheKey = `users:search:${searchTerm || ''}:${userType || ''}:${active || ''}:${verified || ''}:${sortBy}:${sortDirection}:${page}:${pageSize}`;

    return this.getFromCacheOrDb(cacheKey, method, async () => {
      // Build where conditions
      const where: any = {
        deletedAt: null
      };

      // Add filters
      if (searchTerm) {
        where.OR = [
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { profile: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
          { profile: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
          { profile: { displayName: { contains: searchTerm, mode: 'insensitive' } } }
        ];
      }

      if (userType) {
        where.userType = userType;
      }

      if (active !== undefined) {
        where.active = active;
      }

      if (verified !== undefined) {
        where.emailVerified = verified;
      }

      // Build sort options
      let orderBy: any = {};
      
      switch (sortBy) {
        case 'email':
          orderBy.email = sortDirection;
          break;
        case 'firstName':
          orderBy.profile = { firstName: sortDirection };
          break;
        case 'lastName':
          orderBy.profile = { lastName: sortDirection };
          break;
        case 'lastLogin':
          orderBy.lastLogin = sortDirection;
          break;
        default:
          orderBy.createdAt = sortDirection;
      }

      // Get total count
      const total = await this.count(where);

      // Get paginated results
      const users = await this.executeQuery('findMany', method, async () => {
        return await this.prisma.user.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            profile: true
          }
        });
      });

      return { users, total };
    }, 60); // Short TTL for search results
  }

  /**
   * Soft delete a user (mark as deleted without removing from database)
   */
  async softDeleteUser(userId: string): Promise<User> {
    const method = 'softDeleteUser';
    
    const user = await this.executeQuery('update', method, async () => {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          active: false,
          deletedAt: new Date()
        }
      });
    });
    
    // Invalidate cache for this user
    await this.invalidateCache(`user:id:${userId}:*`, method);
    if (user.email) {
      await this.invalidateCache(`user:email:${user.email}:*`, method);
    }
    
    return user;
  }

  /**
   * Get users with specified role
   */
  async getUsersByRole(roleName: string): Promise<User[]> {
    const method = 'getUsersByRole';
    const cacheKey = `users:role:${roleName}`;
    
    return this.getFromCacheOrDb(cacheKey, method, async () => {
      return this.executeQuery('findMany', method, async () => {
        return await this.prisma.user.findMany({
          where: {
            roles: {
              some: {
                role: {
                  name: roleName
                }
              }
            },
            deletedAt: null
          },
          include: {
            profile: true,
            roles: {
              include: {
                role: true
              }
            }
          }
        });
      });
    }, this.cacheTtl);
  }

  /**
   * Get user by ID with specified relations
   */
  async getUserWithRelations(
    userId: string, 
    relations: string[]
  ): Promise<User | null> {
    const method = 'getUserWithRelations';
    const relationsKey = relations.sort().join(',');
    const cacheKey = `user:id:${userId}:relations:${relationsKey}`;
    
    return this.getFromCacheOrDb(cacheKey, method, async () => {
      return this.executeQuery('findUnique', method, async () => {
        const include: Record<string, boolean | object> = {};
        
        // Add requested relations
        relations.forEach(relation => {
          include[relation] = true;
        });
        
        return await this.prisma.user.findFirst({
          where: { id: userId, deletedAt: null },
          include
        });
      });
    }, this.cacheTtl);
  }
  
  /**
   * Find user by ID
   */
  async findById(userId: string, includeProfile: boolean = false): Promise<User | null> {
    const method = 'findById';
    const cacheKey = `user:id:${userId}:${includeProfile}`;
    
    return this.getFromCacheOrDb(cacheKey, method, async () => {
      return this.executeQuery('findUnique', method, async () => {
        return await this.prisma.user.findUnique({
          where: { id: userId },
          include: includeProfile ? { profile: true } : undefined
        });
      });
    }, this.cacheTtl);
  }
  
  /**
   * Count users based on criteria
   */
  private async count(where: any): Promise<number> {
    return this.executeQuery('count', 'count', async () => {
      return await this.prisma.user.count({ where });
    });
  }
}
