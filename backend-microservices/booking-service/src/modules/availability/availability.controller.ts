import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ParseIntPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Service } from '../../models/service.model';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new availability slot (admin or vendor)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Availability slot created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Availability slot overlaps with existing slot' })
  async create(@Body() createAvailabilityDto: CreateAvailabilityDto, @Req() req) {
    // Vendors can only create availability for their own services
    if (req.user.role === 'vendor') {
      // Get the service to check ownership
      const service = await Service.findByPk(createAvailabilityDto.serviceId);
      if (!service) {
        throw new BadRequestException(`Service with ID ${createAvailabilityDto.serviceId} not found`);
      }

      if (service.providerId !== req.user.id) {
        throw new BadRequestException('You can only create availability for your own services');
      }
    }
    
    return this.availabilityService.create(createAvailabilityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all availability slots with optional filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability slots retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Filter by service ID', type: String })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('serviceId') serviceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.availabilityService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      serviceId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('service/:serviceId')
  @ApiOperation({ summary: 'Get all availability slots for a specific service' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability slots found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  async findByService(@Param('serviceId', ParseUUIDPipe) serviceId: string) {
    return this.availabilityService.findByService(serviceId);
  }

  @Get('slots/:serviceId')
  @ApiOperation({ summary: 'Get available booking slots for a service within a date range' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Available slots retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Service not found' })
  @ApiParam({ name: 'serviceId', description: 'Service ID' })
  @ApiQuery({ name: 'startDate', description: 'Start date (YYYY-MM-DD)', required: true })
  @ApiQuery({ name: 'endDate', description: 'End date (YYYY-MM-DD)', required: true })
  async getAvailableSlots(
    @Param('serviceId', ParseUUIDPipe) serviceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate query parameters are required');
    }
    
    return this.availabilityService.getAvailableSlots(
      serviceId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get availability slot by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability slot found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Availability slot not found' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.availabilityService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update availability slot by ID (admin or vendor)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability slot updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Availability slot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Availability slot overlaps with existing slot' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
    @Req() req,
  ) {
    const availability = await this.availabilityService.findById(id);
    
    // Vendors can only update their own services' availability
    if (req.user.role === 'vendor') {
      // Get the service to check ownership
      const service = await Service.findByPk(availability.serviceId);
      if (!service) {
        throw new BadRequestException(`Service with ID ${availability.serviceId} not found`);
      }

      if (service.providerId !== req.user.id) {
        throw new BadRequestException('You can only update availability for your own services');
      }
    }
    
    return this.availabilityService.update(id, updateAvailabilityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete availability slot by ID (admin or vendor)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Availability slot deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Availability slot not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiParam({ name: 'id', description: 'Availability slot ID' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const availability = await this.availabilityService.findById(id);
    
    // Vendors can only delete their own services' availability
    if (req.user.role === 'vendor') {
      // Get the service to check ownership
      const service = await Service.findByPk(availability.serviceId);
      if (!service) {
        throw new BadRequestException(`Service with ID ${availability.serviceId} not found`);
      }

      if (service.providerId !== req.user.id) {
        throw new BadRequestException('You can only delete availability for your own services');
      }
    }
    
    await this.availabilityService.remove(id);
    return;
  }
}
