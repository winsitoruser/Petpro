import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PetHotelBookingService } from './pet-hotel-booking.service';
import { CreatePetHotelBookingDto } from './dto/create-pet-hotel-booking.dto';
import { UpdatePetHotelBookingDto } from './dto/update-pet-hotel-booking.dto';
import { PetHotelBooking, BookingStatus } from '../../models/pet-hotel/pet-hotel-booking.model';
import { VendorId } from '../../common/decorators/vendor-id.decorator';

@ApiTags('pet-hotel-bookings')
@Controller('pet-hotel-bookings')
export class PetHotelBookingController {
  constructor(private readonly petHotelBookingService: PetHotelBookingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pet hotel booking' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Booking created successfully', type: PetHotelBooking })
  async create(@Body() createPetHotelBookingDto: CreatePetHotelBookingDto): Promise<PetHotelBooking> {
    return this.petHotelBookingService.create(createPetHotelBookingDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pet hotel bookings' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Filter by vendor ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by booking status', enum: BookingStatus })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bookings retrieved successfully', type: [PetHotelBooking] })
  async findAll(
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: BookingStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PetHotelBooking[]> {
    return this.petHotelBookingService.findAll(
      vendorId, 
      status, 
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get('vendor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pet hotel bookings for current vendor' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by booking status', enum: BookingStatus })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date (YYYY-MM-DD)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bookings retrieved successfully', type: [PetHotelBooking] })
  async findVendorBookings(
    @VendorId() vendorId: string,
    @Query('status') status?: BookingStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PetHotelBooking[]> {
    return this.petHotelBookingService.findAll(
      vendorId, 
      status, 
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a pet hotel booking by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking retrieved successfully', type: PetHotelBooking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  async findOne(@Param('id') id: string): Promise<PetHotelBooking> {
    return this.petHotelBookingService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a pet hotel booking' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking updated successfully', type: PetHotelBooking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid update data' })
  async update(
    @Param('id') id: string,
    @Body() updatePetHotelBookingDto: UpdatePetHotelBookingDto,
  ): Promise<PetHotelBooking> {
    return this.petHotelBookingService.update(id, updatePetHotelBookingDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a pet hotel booking status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Booking status updated successfully', type: PetHotelBooking })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status update' })
  async updateStatus(
    @Param('id') id: string,
    @Body() statusUpdate: { status: BookingStatus; cancellationReason?: string },
  ): Promise<PetHotelBooking> {
    return this.petHotelBookingService.updateStatus(id, statusUpdate.status, statusUpdate.cancellationReason);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pet hotel booking' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Booking deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Booking not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot delete an active booking' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.petHotelBookingService.remove(id);
  }
}
