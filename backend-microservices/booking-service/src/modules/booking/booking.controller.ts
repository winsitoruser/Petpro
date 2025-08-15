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
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus } from '../../models/booking.model';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Booking created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Time slot not available' })
  async create(@Body() createBookingDto: CreateBookingDto, @Req() req) {
    // If user is customer, ensure they can only create bookings for themselves
    if (req.user.role === 'customer' && req.user.id !== createBookingDto.customerId) {
      throw new BadRequestException('You can only create bookings for yourself');
    }
    
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings with filters (role-based access)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bookings retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID', type: String })
  @ApiQuery({ name: 'providerId', required: false, description: 'Filter by provider ID', type: String })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: BookingStatus })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
    @Query('status') status?: BookingStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    // Role-based access control
    // Customers can only see their own bookings
    if (req.user.role === 'customer') {
      customerId = req.user.id;
    }

    // Vendors can only see bookings related to their services
    if (req.user.role === 'vendor') {
      providerId = req.user.id;
    }
    
    return this.bookingService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      customerId,
      providerId,
      status,
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined,
    );
  }

  @Get('upcoming')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upcoming bookings for next X days (role-based access)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Upcoming bookings retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look ahead', type: Number })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID', type: String })
  @ApiQuery({ name: 'providerId', required: false, description: 'Filter by provider ID', type: String })
  async getUpcomingBookings(
    @Req() req,
    @Query('days') days?: string,
    @Query('customerId') customerId?: string,
    @Query('providerId') providerId?: string,
  ) {
    // Role-based access control
    // Customers can only see their own bookings
    if (req.user.role === 'customer') {
      customerId = req.user.id;
    }

    // Vendors can only see bookings related to their services
    if (req.user.role === 'vendor') {
      providerId = req.user.id;
    }
    
    return this.bookingService.getUpcomingBookings(
      customerId,
      providerId,
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get('reference/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by reference number' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiParam({ name: 'reference', description: 'Booking reference number' })
  async findByReference(@Param('reference') reference: string, @Req() req) {
    const booking = await this.bookingService.findByReference(reference);
    
    // Role-based access control
    // Customers can only see their own bookings
    if (req.user.role === 'customer' && booking.customerId !== req.user.id) {
      throw new BadRequestException('You do not have permission to view this booking');
    }

    // Vendors can only see bookings related to their services
    if (req.user.role === 'vendor' && booking.service.providerId !== req.user.id) {
      throw new BadRequestException('You do not have permission to view this booking');
    }
    
    return booking;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const booking = await this.bookingService.findById(id);
    
    // Role-based access control
    // Customers can only see their own bookings
    if (req.user.role === 'customer' && booking.customerId !== req.user.id) {
      throw new BadRequestException('You do not have permission to view this booking');
    }

    // Vendors can only see bookings related to their services
    if (req.user.role === 'vendor' && booking.service.providerId !== req.user.id) {
      throw new BadRequestException('You do not have permission to view this booking');
    }
    
    return booking;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor', 'customer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking by ID (role-based access)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req,
  ) {
    const booking = await this.bookingService.findById(id);
    
    // Role-based access control
    // Customers can only update their own bookings and certain fields
    if (req.user.role === 'customer') {
      if (booking.customerId !== req.user.id) {
        throw new BadRequestException('You can only update your own bookings');
      }

      // Customers can only update specific fields
      const allowedFields = ['specialRequests'];
      const attemptedFields = Object.keys(updateBookingDto);
      
      for (const field of attemptedFields) {
        if (!allowedFields.includes(field)) {
          throw new BadRequestException(`Customers cannot update the '${field}' field`);
        }
      }
    }

    // Vendors can only update bookings for their services
    if (req.user.role === 'vendor' && booking.service.providerId !== req.user.id) {
      throw new BadRequestException('You can only update bookings for your services');
    }
    
    return this.bookingService.update(id, updateBookingDto);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking (role-based access)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async cancel(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const booking = await this.bookingService.findById(id);
    
    // Role-based access control
    // Customers can only cancel their own bookings
    if (req.user.role === 'customer' && booking.customerId !== req.user.id) {
      throw new BadRequestException('You can only cancel your own bookings');
    }

    // Vendors can only cancel bookings for their services
    if (req.user.role === 'vendor' && booking.service.providerId !== req.user.id) {
      throw new BadRequestException('You can only cancel bookings for your services');
    }
    
    return { success: await this.bookingService.cancel(id) };
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm a booking (admin or vendor only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking confirmed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async confirm(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const booking = await this.bookingService.findById(id);
    
    // Vendors can only confirm bookings for their services
    if (req.user.role === 'vendor' && booking.service.providerId !== req.user.id) {
      throw new BadRequestException('You can only confirm bookings for your services');
    }
    
    return this.bookingService.confirm(id);
  }

  @Patch(':id/reminder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a reminder for a booking (admin or vendor only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reminder sent successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  async sendReminder(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const booking = await this.bookingService.findById(id);
    
    // Vendors can only send reminders for their services
    if (req.user.role === 'vendor' && booking.service.providerId !== req.user.id) {
      throw new BadRequestException('You can only send reminders for your service bookings');
    }
    
    return { success: await this.bookingService.sendReminder(id) };
  }
}
