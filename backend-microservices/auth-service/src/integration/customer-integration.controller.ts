import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Logger,
  Get,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CustomerIntegrationService } from './customer-integration.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';

@ApiTags('customer-integration')
@Controller('integration/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomerIntegrationController {
  private readonly logger = new Logger(CustomerIntegrationController.name);

  constructor(private readonly customerIntegrationService: CustomerIntegrationService) {}

  @Post('sync/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Synchronize customer data from external system' })
  @ApiResponse({ status: 200, description: 'Customer data synchronized successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Failed to synchronize data' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to synchronize' })
  async syncCustomerData(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('externalSystemId') externalSystemId?: string,
  ) {
    this.logger.log(`Received request to sync customer data for user ${userId}`);
    const success = await this.customerIntegrationService.syncCustomerData(userId, externalSystemId);
    
    if (success) {
      return { success: true, message: 'Customer data synchronized successfully' };
    } else {
      return { success: false, message: 'Failed to synchronize customer data' };
    }
  }

  @Post('push/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Push customer data to external system' })
  @ApiResponse({ status: 200, description: 'Customer data pushed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Failed to push data' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to push' })
  async pushCustomerData(@Param('userId', ParseUUIDPipe) userId: string) {
    this.logger.log(`Received request to push customer data for user ${userId}`);
    const success = await this.customerIntegrationService.pushCustomerToExternalSystem(userId);
    
    if (success) {
      return { success: true, message: 'Customer data pushed successfully' };
    } else {
      return { success: false, message: 'Failed to push customer data' };
    }
  }

  @Post('sync-batch')
  @Roles('admin')
  @ApiOperation({ summary: 'Synchronize multiple customers from external system' })
  @ApiResponse({ status: 200, description: 'Customer data synchronization initiated' })
  @ApiResponse({ status: 500, description: 'Failed to start synchronization' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of customers to sync' })
  async syncMultipleCustomers(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    this.logger.log(`Received request to sync multiple customers, limit: ${limit}`);
    const result = await this.customerIntegrationService.syncMultipleCustomers(limit);
    
    return {
      success: true,
      message: `Synchronized ${result.success} customers, failed: ${result.failed}`,
      ...result
    };
  }

  @Get('webhook')
  @ApiOperation({ summary: 'Webhook endpoint for external system notifications' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  async webhook(
    @Query('event') event: string,
    @Query('userId') userId: string,
    @Query('externalId') externalId: string,
  ) {
    this.logger.log(`Received webhook event: ${event}, userId: ${userId}, externalId: ${externalId}`);
    
    if (event === 'customer.updated' && externalId) {
      // Find user by external ID
      // For a real implementation, you would add a method in the service to find user by external ID
      // and then sync the data
      
      return {
        success: true,
        message: 'Webhook processed',
        event,
        action: 'queued_for_processing'
      };
    }
    
    return {
      success: true,
      message: 'Webhook received',
      event,
      action: 'no_action_required'
    };
  }
}
