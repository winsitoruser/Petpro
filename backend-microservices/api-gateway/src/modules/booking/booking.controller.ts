import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  private readonly bookingServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,

    private readonly configService: ConfigService,
  ) {
    this.bookingServiceUrl = this.configService.get<string>('BOOKING_SERVICE_URL') || 'http://localhost:3002';
  }

  @Get('services')
  @ApiOperation({ summary: 'Get all available services' })
  @ApiResponse({ status: 200, description: 'Returns list of services' })
  async getServices(@Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.bookingServiceUrl}/api/v1/services`, {
        params: query,
      })
    );
    return response.data;
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Return the service details' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceById(@Param('id', ParseUUIDPipe) id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.bookingServiceUrl}/api/v1/services/${id}`)
    );
    return response.data;
  }

  @Get('availability')
  @ApiOperation({ summary: 'Get service availability' })
  @ApiResponse({ status: 200, description: 'Returns availability slots for the service' })
  async getAvailability(@Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.bookingServiceUrl}/api/v1/availability`, {
        params: query,
      })
    );
    return response.data;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all bookings with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Returns bookings list with pagination metadata' })
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.bookingServiceUrl}/api/v1/bookings`, {
        params: { ...query, userId: user.id, userRole: user.role },
        headers: { 'X-User-Id': user.id, 'X-User-Role': user.role },
      })
    );
    return response.data;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Return the booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.bookingServiceUrl}/api/v1/bookings/${id}`, {
        headers: { 'X-User-Id': user.id, 'X-User-Role': user.role },
      })
    );
    return response.data;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createBookingDto: any, @CurrentUser() user: any) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.bookingServiceUrl}/api/v1/bookings`,
        { ...createBookingDto, customerId: user.id },
        {
          headers: { 'X-User-Id': user.id, 'Content-Type': 'application/json' },
        }
      )
    );
    return response.data;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully updated' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBookingDto: any, @CurrentUser() user: any) {
    const response = await firstValueFrom(
      this.httpService.put(
        `${this.bookingServiceUrl}/api/v1/bookings/${id}`,
        updateBookingDto,
        {
          headers: { 'X-User-Id': user.id, 'X-User-Role': user.role, 'Content-Type': 'application/json' },
        }
      )
    );
    return response.data;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({ status: 200, description: 'Booking successfully cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const response = await firstValueFrom(
      this.httpService.delete(`${this.bookingServiceUrl}/api/v1/bookings/${id}`, {
        headers: { 'X-User-Id': user.id, 'X-User-Role': user.role },
      })
    );
    return response.data;
  }

}
