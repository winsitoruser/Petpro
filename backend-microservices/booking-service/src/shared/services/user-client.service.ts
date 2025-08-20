import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/**
 * Shared User Interface for consistency
 */
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  isEmailVerified?: boolean;
  active?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserReference {
  id: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'vendor' | 'admin';
}

/**
 * User Client Service for Inter-Service Communication
 * Safely communicates with Auth Service without breaking existing code
 */
@Injectable()
export class UserClientService {
  private readonly logger = new Logger(UserClientService.name);
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001';
  }

  /**
   * Get user by ID from Auth Service
   * SAFE: Returns null if service is down, won't break application
   */
  async getUserById(userId: string): Promise<IUser | null> {
    if (!userId) {
      this.logger.warn('getUserById called with empty userId');
      return null;
    }

    try {
      this.logger.debug(`Fetching user ${userId} from ${this.authServiceUrl}`);
      
      const response = await firstValueFrom(
        this.httpService.get<IUser>(`${this.authServiceUrl}/api/internal/users/${userId}`, {
          timeout: 5000, // 5 second timeout
        })
      );
      
      this.logger.debug(`Successfully fetched user ${userId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch user ${userId}: ${error.message}`);
      
      // SAFE FALLBACK: Return null instead of throwing
      // Application can continue with limited functionality
      return null;
    }
  }

  /**
   * Get multiple users by IDs (batch operation)
   * SAFE: Returns empty array if fails
   */
  async getUsersByIds(userIds: string[]): Promise<IUser[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const validUserIds = userIds.filter(id => id && id.trim() !== '');
    if (validUserIds.length === 0) {
      return [];
    }

    try {
      this.logger.debug(`Batch fetching ${validUserIds.length} users`);
      
      const response = await firstValueFrom(
        this.httpService.post<IUser[]>(`${this.authServiceUrl}/api/internal/users/bulk`, {
          userIds: validUserIds
        }, {
          timeout: 10000, // 10 second timeout for batch
        })
      );
      
      this.logger.debug(`Successfully fetched ${response.data.length} users`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to batch fetch users: ${error.message}`);
      return [];
    }
  }

  /**
   * Get user reference (minimal data) for display purposes
   * SAFE: Returns null if user not found
   */
  async getUserReference(userId: string): Promise<IUserReference | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  /**
   * Get user's display name safely
   * SAFE: Returns "Unknown User" if not found
   */
  async getUserDisplayName(userId: string): Promise<string> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return 'Unknown User';
      
      return `${user.firstName} ${user.lastName}`.trim() || 'Unknown User';
    } catch (error) {
      this.logger.error(`Failed to get display name for user ${userId}: ${error.message}`);
      return 'Unknown User';
    }
  }

  /**
   * Check if user exists (safe check)
   * SAFE: Returns false if service is down
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user !== null;
    } catch (error) {
      this.logger.error(`Failed to check if user ${userId} exists: ${error.message}`);
      return false; // SAFE DEFAULT
    }
  }

  /**
   * Validate user has specific role
   * SAFE: Returns false if can't verify
   */
  async userHasRole(userId: string, role: 'customer' | 'vendor' | 'admin'): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user?.role === role || false;
    } catch (error) {
      this.logger.error(`Failed to check role for user ${userId}: ${error.message}`);
      return false; // SAFE DEFAULT
    }
  }
}