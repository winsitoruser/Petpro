import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IUser, IUserReference } from '../interfaces/user.interface';
import { firstValueFrom } from 'rxjs';

/**
 * User Client Service for Inter-Service Communication
 * Handles communication with Auth Service for user data
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
   */
  async getUserById(userId: string): Promise<IUser | null> {
    if (!userId) {
      this.logger.warn('getUserById called with empty userId');
      return null;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<IUser>(`${this.authServiceUrl}/api/internal/users/${userId}`)
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch user ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * Get multiple users by IDs (batch operation)
   */
  async getUsersByIds(userIds: string[]): Promise<IUser[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<IUser[]>(`${this.authServiceUrl}/api/internal/users/bulk`, {
          userIds: userIds.filter(id => id) // Remove empty IDs
        })
      );
      
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch users in bulk:`, error.message);
      return [];
    }
  }

  /**
   * Get user reference (minimal data) for display purposes
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
   * Get multiple user references
   */
  async getUserReferences(userIds: string[]): Promise<IUserReference[]> {
    const users = await this.getUsersByIds(userIds);
    return users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));
  }

  /**
   * Check if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user !== null;
  }

  /**
   * Get user's full name
   */
  async getUserFullName(userId: string): Promise<string | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;
    
    return `${user.firstName} ${user.lastName}`.trim();
  }

  /**
   * Validate user has specific role
   */
  async userHasRole(userId: string, role: 'customer' | 'vendor' | 'admin'): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user?.role === role || false;
  }
}