import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { DashboardService } from '../dashboard/dashboard.service';

@Controller()
export class AdminMicroserviceController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly dashboardService: DashboardService,
  ) {}

  // Auth related endpoints
  @MessagePattern('admin_login')
  async adminLogin(@Payload() loginDto: any) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('admin_logout')
  async adminLogout(@Payload() data: { token: string }) {
    try {
      const userId = this.extractUserIdFromToken(data.token);
      return await this.authService.logout(userId, data.token);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('admin_profile')
  async adminProfile(@Payload() data: { token: string }) {
    try {
      const userId = this.extractUserIdFromToken(data.token);
      return await this.userService.findById(userId);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('create_admin')
  async createAdmin(@Payload() data: { createAdminDto: any; token: string }) {
    try {
      return await this.authService.createAdmin(data.createAdminDto);
    } catch (error) {
      return { error: error.message };
    }
  }

  // User management endpoints
  @MessagePattern('get_admin_users')
  async getAdminUsers(@Payload() data: { token: string; query: any }) {
    try {
      const { page, limit, search } = data.query;
      return await this.userService.findAll(page, limit, search);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('get_admin_user')
  async getAdminUser(@Payload() data: { id: string; token: string }) {
    try {
      return await this.userService.findById(data.id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('update_admin_user')
  async updateAdminUser(@Payload() data: { id: string; data: any; token: string }) {
    try {
      const adminId = this.extractUserIdFromToken(data.token);
      return await this.userService.updateUser(data.id, data.data, adminId);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('deactivate_admin_user')
  async deactivateAdminUser(@Payload() data: { id: string; token: string }) {
    try {
      const adminId = this.extractUserIdFromToken(data.token);
      return await this.userService.deactivateUser(data.id, adminId);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('activate_admin_user')
  async activateAdminUser(@Payload() data: { id: string; token: string }) {
    try {
      const adminId = this.extractUserIdFromToken(data.token);
      return await this.userService.activateUser(data.id, adminId);
    } catch (error) {
      return { error: error.message };
    }
  }

  // Dashboard endpoints
  @MessagePattern('get_dashboard_stats')
  async getDashboardStats(@Payload() data: { token: string }) {
    try {
      return await this.dashboardService.getDashboardStats();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('get_recent_activity')
  async getRecentActivity(@Payload() data: { token: string; query: any }) {
    try {
      const { limit } = data.query;
      return await this.dashboardService.getRecentActivity(limit);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern('get_system_health')
  async getSystemHealth(@Payload() data: { token: string }) {
    try {
      return await this.dashboardService.getSystemHealth();
    } catch (error) {
      return { error: error.message };
    }
  }

  private extractUserIdFromToken(token: string): string {
    // Simple token extraction - in production use proper JWT verification
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return payload.sub;
    } catch {
      throw new Error('Invalid token');
    }
  }
} 