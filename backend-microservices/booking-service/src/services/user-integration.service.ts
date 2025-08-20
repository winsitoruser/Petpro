import { Injectable, Logger } from '@nestjs/common';
import { UserClientService, IUser, IUserReference } from '../shared/services/user-client.service';
import { User } from '../models/user.model'; // Existing local User model

/**
 * User Integration Service
 * 
 * SAFE MIGRATION APPROACH:
 * - Keeps existing User model functional
 * - Adds new UserClient functionality alongside
 * - Allows gradual migration without breaking changes
 * - Provides fallback to local data if remote service fails
 */
@Injectable()
export class UserIntegrationService {
  private readonly logger = new Logger(UserIntegrationService.name);

  constructor(
    private readonly userClient: UserClientService,
  ) {}

  /**
   * SAFE: Get user data with fallback to local User model
   * 
   * This approach allows us to:
   * 1. Try to get fresh data from auth-service
   * 2. Fall back to local User model if remote fails
   * 3. Gradually migrate without breaking existing functionality
   */
  async getUser(userId: string): Promise<IUser | null> {
    try {
      // TRY: Get from auth-service first (centralized data)
      const remoteUser = await this.userClient.getUserById(userId);
      if (remoteUser) {
        this.logger.debug(`Got user ${userId} from auth-service`);
        return remoteUser;
      }

      // FALLBACK: Try local User model (existing behavior)
      this.logger.warn(`Auth-service unavailable, checking local User model for ${userId}`);
      const localUser = await User.findByPk(userId);
      if (localUser) {
        this.logger.debug(`Got user ${userId} from local database`);
        return {
          id: localUser.id,
          firstName: localUser.firstName,
          lastName: localUser.lastName,
          email: '', // Not stored in booking service local model
          role: localUser.role as any,
          active: true, // Default to true since booking service doesn't track this
          createdAt: localUser.createdAt,
          updatedAt: localUser.updatedAt,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}: ${error.message}`);
      return null;
    }
  }

  /**
   * SAFE: Get user display name with multiple fallbacks
   */
  async getUserDisplayName(userId: string): Promise<string> {
    try {
      // TRY: Remote first
      const displayName = await this.userClient.getUserDisplayName(userId);
      if (displayName && displayName !== 'Unknown User') {
        return displayName;
      }

      // FALLBACK: Local User model
      const localUser = await User.findByPk(userId);
      if (localUser) {
        return `${localUser.firstName} ${localUser.lastName}`.trim() || 'Unknown User';
      }

      return 'Unknown User';
    } catch (error) {
      this.logger.error(`Failed to get display name for ${userId}: ${error.message}`);
      return 'Unknown User';
    }
  }

  /**
   * SAFE: Batch get users with mixed approach
   */
  async getUsers(userIds: string[]): Promise<Map<string, IUser>> {
    const userMap = new Map<string, IUser>();
    
    if (!userIds || userIds.length === 0) {
      return userMap;
    }

    try {
      // TRY: Batch get from auth-service
      const remoteUsers = await this.userClient.getUsersByIds(userIds);
      remoteUsers.forEach(user => {
        userMap.set(user.id, user);
      });

      // FALLBACK: Get missing users from local model
      const missingUserIds = userIds.filter(id => !userMap.has(id));
      if (missingUserIds.length > 0) {
        this.logger.warn(`Getting ${missingUserIds.length} users from local database`);
        
        const localUsers = await User.findAll({
          where: { id: missingUserIds }
        });

        localUsers.forEach(localUser => {
          userMap.set(localUser.id, {
            id: localUser.id,
            firstName: localUser.firstName,
            lastName: localUser.lastName,
            email: '', // Not available locally
            role: localUser.role as any,
            active: true, // Default to true since booking service doesn't track this
            createdAt: localUser.createdAt,
            updatedAt: localUser.updatedAt,
          });
        });
      }

    } catch (error) {
      this.logger.error(`Failed to batch get users: ${error.message}`);
    }

    return userMap;
  }

  /**
   * SAFE: Check if we should use remote or local data
   * This can be controlled via feature flag or environment variable
   */
  shouldUseRemoteUserService(): boolean {
    // You can add feature flag logic here
    // For now, always try remote first with local fallback
    return true;
  }

  /**
   * SAFE: Validate user exists (checks both remote and local)
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      // Check remote first
      const remoteExists = await this.userClient.userExists(userId);
      if (remoteExists) {
        return true;
      }

      // Check local fallback
      const localUser = await User.findByPk(userId);
      return localUser !== null;
    } catch (error) {
      this.logger.error(`Failed to check if user exists ${userId}: ${error.message}`);
      return false;
    }
  }
}