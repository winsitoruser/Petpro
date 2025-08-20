import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Logger,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';

interface BulkUserRequest {
  userIds: string[];
}

@ApiTags('internal-users')
@Controller('api/internal/users')
export class InternalUserController {
  private readonly logger = new Logger(InternalUserController.name);

  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (internal service communication)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUserById(@Param('id') id: string) {
    try {
      this.logger.debug(`Internal request for user: ${id}`);
      
      const user = await this.userService.findById(id);
      if (!user) {
        this.logger.warn(`User not found: ${id}`);
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`Failed to get user ${id}: ${error.message}`);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Get multiple users by IDs (internal service communication)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
  async getUsersByIds(@Body() request: BulkUserRequest) {
    try {
      const { userIds } = request;
      
      if (!userIds || !Array.isArray(userIds)) {
        throw new HttpException('Invalid userIds array', HttpStatus.BAD_REQUEST);
      }

      this.logger.debug(`Internal bulk request for ${userIds.length} users`);
      
      const users = await this.userService.findByIds(userIds);
      
      this.logger.debug(`Returning ${users.length} users for bulk request`);
      return users;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`Failed to bulk get users: ${error.message}`);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}