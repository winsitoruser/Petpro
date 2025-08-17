import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AdminController {
  constructor(private adminService: AdminService) {}

  private getToken(req: any): string {
    return req.get('Authorization')?.replace('Bearer ', '');
  }

  // User Management Routes
  @ApiOperation({ summary: 'Get all admin users' })
  @Get('users')
  async getUsers(@Request() req: any, @Query() query: any) {
    return this.adminService.getUsers(this.getToken(req), query);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @Get('users/:id')
  async getUserById(@Param('id') id: string, @Request() req: any) {
    return this.adminService.getUserById(id, this.getToken(req));
  }

  @ApiOperation({ summary: 'Update user' })
  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req: any,
  ) {
    return this.adminService.updateUser(id, updateData, this.getToken(req));
  }

  @ApiOperation({ summary: 'Deactivate user' })
  @Delete('users/:id/deactivate')
  async deactivateUser(@Param('id') id: string, @Request() req: any) {
    return this.adminService.deactivateUser(id, this.getToken(req));
  }

  @ApiOperation({ summary: 'Activate user' })
  @Put('users/:id/activate')
  async activateUser(@Param('id') id: string, @Request() req: any) {
    return this.adminService.activateUser(id, this.getToken(req));
  }

  // Dashboard Routes
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @Get('dashboard/stats')
  async getDashboardStats(@Request() req: any) {
    return this.adminService.getDashboardStats(this.getToken(req));
  }

  @ApiOperation({ summary: 'Get recent activity' })
  @Get('dashboard/activity')
  async getRecentActivity(@Request() req: any, @Query() query: any) {
    return this.adminService.getRecentActivity(this.getToken(req), query);
  }

  @ApiOperation({ summary: 'Get system health' })
  @Get('dashboard/health')
  async getSystemHealth(@Request() req: any) {
    return this.adminService.getSystemHealth(this.getToken(req));
  }

}