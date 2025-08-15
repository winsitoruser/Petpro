import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    @Inject('BOOKING_SERVICE') private readonly bookingServiceClient: ClientProxy,
  ) {}

  @Get('services')
  @ApiOperation({ summary: 'Get all available services' })
  @ApiResponse({ status: 200, description: 'Returns list of services' })
  async getServices(@Query() query: any) {
    return firstValueFrom(this.bookingServiceClient.send('booking.services.findAll', query));
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Return the service details' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceById(@Param('id', ParseUUIDPipe) id: string) {
    return firstValueFrom(this.bookingServiceClient.send('booking.services.findOne', { id }));
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get service availability' })
  @ApiResponse({ status: 200, description: 'Returns availability slots for the service' })
  async getAvailability(@Query() query: any) {
    return firstValueFrom(this.bookingServiceClient.send('booking.availability.findAll', query));
  }
  
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Returns bookings list with pagination metadata' })
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    // Add user context to the query for proper authorization
    const payload = { ...query, userId: user.id, userRole: user.role };
    return firstValueFrom(this.bookingServiceClient.send('booking.findAll', payload));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Return the booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return firstValueFrom(this.bookingServiceClient.send('booking.findOne', { id, userId: user.id, userRole: user.role }));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createBookingDto: any, @CurrentUser() user: any) {
    // Assign current user ID as customer ID
    const payload = { ...createBookingDto, customerId: user.id };
    return firstValueFrom(this.bookingServiceClient.send('booking.create', payload));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully updated' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBookingDto: any, @CurrentUser() user: any) {
    const payload = { id, ...updateBookingDto, userId: user.id, userRole: user.role };
    return firstValueFrom(this.bookingServiceClient.send('booking.update', payload));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return firstValueFrom(this.bookingServiceClient.send('booking.cancel', { id, userId: user.id, userRole: user.role }));
  }

}
