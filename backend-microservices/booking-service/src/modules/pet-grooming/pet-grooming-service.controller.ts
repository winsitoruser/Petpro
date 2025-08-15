import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PetGroomingServiceService } from './pet-grooming-service.service';
import { CreatePetGroomingServiceDto } from './dto/create-pet-grooming-service.dto';
import { UpdatePetGroomingServiceDto } from './dto/update-pet-grooming-service.dto';
import { PetGroomingService, PetType, SizeCategory } from '../../models/pet-grooming/pet-grooming-service.model';

@ApiTags('pet-grooming-services')
@Controller('pet-grooming-services')
@ApiBearerAuth()
export class PetGroomingServiceController {
  constructor(private readonly petGroomingServiceService: PetGroomingServiceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiOperation({ summary: 'Create a new pet grooming service' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pet grooming service created successfully', type: PetGroomingService })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid service data' })
  async create(@Body() createPetGroomingServiceDto: CreatePetGroomingServiceDto, @Req() req): Promise<PetGroomingService> {
    return this.petGroomingServiceService.create(req.user.vendorId, createPetGroomingServiceDto);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get all pet grooming services for a vendor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pet grooming services retrieved successfully', type: [PetGroomingService] })
  async findAllByVendorId(@Param('vendorId') vendorId: string): Promise<PetGroomingService[]> {
    return this.petGroomingServiceService.findAllByVendorId(vendorId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for pet grooming services' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pet grooming services retrieved successfully', type: [PetGroomingService] })
  @ApiQuery({ name: 'petType', enum: PetType, required: false })
  @ApiQuery({ name: 'sizeCategory', enum: SizeCategory, required: false })
  @ApiQuery({ name: 'active', type: Boolean, required: false })
  @ApiQuery({ name: 'minPrice', type: Number, required: false })
  @ApiQuery({ name: 'maxPrice', type: Number, required: false })
  @ApiQuery({ name: 'categoryId', type: String, required: false })
  async search(
    @Query('petType') petType?: string,
    @Query('sizeCategory') sizeCategory?: string,
    @Query('active') active?: boolean,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('categoryId') categoryId?: string,
  ): Promise<PetGroomingService[]> {
    return this.petGroomingServiceService.search({
      petType,
      sizeCategory,
      active,
      minPrice,
      maxPrice,
      categoryId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet grooming service by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pet grooming service retrieved successfully', type: PetGroomingService })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet grooming service not found' })
  async findOne(@Param('id') id: string): Promise<PetGroomingService> {
    return this.petGroomingServiceService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiOperation({ summary: 'Update a pet grooming service' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pet grooming service updated successfully', type: PetGroomingService })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet grooming service not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async update(
    @Param('id') id: string, 
    @Body() updatePetGroomingServiceDto: UpdatePetGroomingServiceDto, 
    @Req() req
  ): Promise<PetGroomingService> {
    return this.petGroomingServiceService.update(id, req.user.vendorId, updatePetGroomingServiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pet grooming service' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Pet grooming service deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet grooming service not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Req() req): Promise<void> {
    return this.petGroomingServiceService.remove(id, req.user.vendorId);
  }
}
