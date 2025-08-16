import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  UseGuards,
  Req,
  Param,
  Logger,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity } from './models/activity.model';
import { ActivityType } from './enums/activity-type.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('activities')
@Controller('activities')
export class ActivitiesController {
  private readonly logger = new Logger(ActivitiesController.name);

  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'system')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new activity record (admin/system only)' })
  @ApiResponse({ status: 201, description: 'Activity record created successfully' })
  async create(@Body() createActivityDto: CreateActivityDto, @Req() req): Promise<Activity> {
    this.logger.log(`Creating activity: ${createActivityDto.type} for user ${createActivityDto.userId}`);
    
    // Add IP and user agent if not provided
    if (!createActivityDto.ipAddress) {
      createActivityDto.ipAddress = req.ip;
    }
    
    if (!createActivityDto.userAgent) {
      createActivityDto.userAgent = req.get('user-agent');
    }
    
    return this.activitiesService.create(createActivityDto);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'pet_owner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activities for a specific user' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'types', required: false, isArray: true, enum: ActivityType, description: 'Filter by activity types' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (ISO format)' })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('types') types?: ActivityType[],
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req,
  ): Promise<{ activities: Activity[]; total: number }> {
    this.logger.log(`Getting activities for user: ${userId}`);
    
    // Check if requesting user is the same as the user ID or an admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      this.logger.warn(`User ${req.user.id} attempted to access activities of user ${userId}`);
      // Return empty results instead of throwing error
      return { activities: [], total: 0 };
    }
    
    // Parse dates if provided
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;
    
    return this.activitiesService.findByUserId(
      userId, 
      page, 
      limit, 
      startDateObj, 
      endDateObj, 
      types,
    );
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent activities across all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Recent activities retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'types', required: false, isArray: true, enum: ActivityType, description: 'Filter by activity types' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (ISO format)' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  async findRecent(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('types') types?: ActivityType[],
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
  ): Promise<{ activities: Activity[]; total: number }> {
    this.logger.log('Getting recent activities');
    
    // Parse dates if provided
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;
    
    return this.activitiesService.findRecent(
      page, 
      limit, 
      startDateObj, 
      endDateObj, 
      types,
      userId,
    );
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity statistics for analytics (admin only)' })
  @ApiResponse({ status: 200, description: 'Activity statistics retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'], description: 'Group statistics by time period' })
  async getStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
  ): Promise<any[]> {
    this.logger.log(`Getting activity statistics from ${startDate} to ${endDate} grouped by ${groupBy}`);
    
    // Parse dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    return this.activitiesService.getActivityStatistics(
      startDateObj,
      endDateObj,
      groupBy,
    );
  }
}
