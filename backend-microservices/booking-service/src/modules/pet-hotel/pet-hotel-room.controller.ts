import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PetHotelRoomService } from './pet-hotel-room.service';
import { CreatePetHotelRoomDto } from './dto/create-pet-hotel-room.dto';
import { UpdatePetHotelRoomDto } from './dto/update-pet-hotel-room.dto';
import { PetHotelRoom } from '../../models/pet-hotel/pet-hotel-room.model';
import { PetHotelAvailability } from '../../models/pet-hotel/pet-hotel-availability.model';
import { VendorId } from '../../common/decorators/vendor-id.decorator';

@ApiTags('pet-hotel-rooms')
@Controller('pet-hotel-rooms')
export class PetHotelRoomController {
  constructor(private readonly petHotelRoomService: PetHotelRoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pet hotel room' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Room created successfully', type: PetHotelRoom })
  async create(
    @Body() createPetHotelRoomDto: CreatePetHotelRoomDto,
    @VendorId() vendorId: string,
  ): Promise<PetHotelRoom> {
    return this.petHotelRoomService.create(vendorId, createPetHotelRoomDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pet hotel rooms' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Filter by vendor ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rooms retrieved successfully', type: [PetHotelRoom] })
  async findAll(@Query('vendorId') vendorId?: string): Promise<PetHotelRoom[]> {
    return this.petHotelRoomService.findAll(vendorId);
  }

  @Get('vendor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pet hotel rooms for current vendor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Rooms retrieved successfully', type: [PetHotelRoom] })
  async findByCurrentVendor(@VendorId() vendorId: string): Promise<PetHotelRoom[]> {
    return this.petHotelRoomService.findByVendorId(vendorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet hotel room by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Room retrieved successfully', type: PetHotelRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found' })
  async findOne(@Param('id') id: string): Promise<PetHotelRoom> {
    return this.petHotelRoomService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a pet hotel room' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Room updated successfully', type: PetHotelRoom })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePetHotelRoomDto: UpdatePetHotelRoomDto,
  ): Promise<PetHotelRoom> {
    return this.petHotelRoomService.update(id, updatePetHotelRoomDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pet hotel room' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Room deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.petHotelRoomService.remove(id);
  }

  @Post(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set availability for a pet hotel room' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability set successfully', type: [PetHotelAvailability] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found' })
  async setAvailability(
    @Param('id') id: string,
    @Body() availabilityData: { date: Date; isAvailable: boolean; availableCount?: number }[],
  ): Promise<PetHotelAvailability[]> {
    return this.petHotelRoomService.setAvailability(id, availabilityData);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get availability for a pet hotel room' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Availability retrieved successfully', type: [PetHotelAvailability] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found' })
  async getAvailability(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<PetHotelAvailability[]> {
    return this.petHotelRoomService.getAvailability(
      id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('search/available')
  @ApiOperation({ summary: 'Search for available pet hotel rooms' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Check-in date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Check-out date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'vendorId', required: false, description: 'Filter by vendor ID' })
  @ApiQuery({ name: 'petType', required: false, description: 'Filter by pet type' })
  @ApiQuery({ name: 'petSize', required: false, description: 'Filter by pet size' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Available rooms retrieved successfully', type: [PetHotelRoom] })
  async findAvailable(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('vendorId') vendorId?: string,
    @Query('petType') petType?: string,
    @Query('petSize') petSize?: string,
  ): Promise<PetHotelRoom[]> {
    return this.petHotelRoomService.getAvailableRooms(
      new Date(startDate),
      new Date(endDate),
      vendorId,
      petType,
      petSize,
    );
  }
}
