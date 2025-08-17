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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { AdminRole } from '../../models/admin-user.model';

@ApiTags('User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({ summary: 'Get all admin users' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'john' })
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.userService.findAll(+page, +limit, search);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @ApiOperation({ summary: 'Update user' })
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.userService.updateUser(id, updateUserDto, req.user.id);
  }

  @ApiOperation({ summary: 'Deactivate user' })
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @Delete(':id/deactivate')
  async deactivateUser(@Param('id') id: string, @Request() req: any) {
    return this.userService.deactivateUser(id, req.user.id);
  }

  @ApiOperation({ summary: 'Activate user' })
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @Put(':id/activate')
  async activateUser(@Param('id') id: string, @Request() req: any) {
    return this.userService.activateUser(id, req.user.id);
  }

  @ApiOperation({ summary: 'Get user sessions' })
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @Get(':id/sessions')
  async getUserSessions(@Param('id') id: string) {
    return this.userService.getUserSessions(id);
  }

  @ApiOperation({ summary: 'Revoke user session' })
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  @Delete(':id/sessions/:sessionId')
  async revokeUserSession(
    @Param('id') userId: string,
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    return this.userService.revokeUserSession(userId, sessionId, req.user.id);
  }
}