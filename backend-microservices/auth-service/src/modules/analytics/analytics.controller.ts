import { Controller, Get, Query, UseGuards, ParseIntPipe, ParseEnumPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('customer-growth')
  @Roles('admin')
  @ApiOperation({ summary: 'Get customer growth statistics' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ 
    name: 'interval', 
    required: false, 
    enum: ['day', 'week', 'month'], 
    description: 'Time interval for grouping data' 
  })
  async getCustomerGrowthStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval', new DefaultValuePipe('day'), new ParseEnumPipe(['day', 'week', 'month'])) 
    interval: 'day' | 'week' | 'month',
  ) {
    return this.analyticsService.getCustomerGrowthStats(
      new Date(startDate),
      new Date(endDate),
      interval,
    );
  }

  @Get('customer-activity')
  @Roles('admin')
  @ApiOperation({ summary: 'Get customer activity statistics' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ 
    name: 'interval', 
    required: false, 
    enum: ['day', 'week', 'month'], 
    description: 'Time interval for grouping data' 
  })
  async getCustomerActivityStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('interval', new DefaultValuePipe('day'), new ParseEnumPipe(['day', 'week', 'month'])) 
    interval: 'day' | 'week' | 'month',
  ) {
    return this.analyticsService.getCustomerActivityStats(
      new Date(startDate),
      new Date(endDate),
      interval,
    );
  }

  @Get('customer-demographics')
  @Roles('admin')
  @ApiOperation({ summary: 'Get customer demographics data' })
  async getCustomerDemographics() {
    return this.analyticsService.getCustomerDemographics();
  }

  @Get('service-usage')
  @Roles('admin')
  @ApiOperation({ summary: 'Get service usage metrics' })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  async getServiceUsageMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getServiceUsageMetrics(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('customer-retention')
  @Roles('admin')
  @ApiOperation({ summary: 'Get customer retention metrics' })
  async getCustomerRetentionMetrics() {
    return this.analyticsService.getCustomerRetentionMetrics();
  }
}
