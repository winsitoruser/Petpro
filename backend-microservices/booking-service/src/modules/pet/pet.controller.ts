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
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@ApiTags('pets')
@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pet (admin or customer)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pet created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden resource' })
  async create(@Body() createPetDto: CreatePetDto, @Req() req) {
    // If user is customer, ensure they can only create pets for themselves
    if (req.user.role === 'customer' && req.user.id !== createPetDto.ownerId) {
      throw new BadRequestException('You can only register pets for yourself');
    }
    
    return this.petService.create(createPetDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pets with optional filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pets retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  @ApiQuery({ name: 'ownerId', required: false, description: 'Filter by owner ID', type: String })
  async findAll(
    @Req() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    // Role-based access control
    // Customers can only see their own pets
    if (req.user.role === 'customer') {
      ownerId = req.user.id;
    }
    
    return this.petService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      ownerId,
    );
  }

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Search pets by name or breed (admin or vendor only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Search results' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  async search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.petService.search(query, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 10);
  }

  @Get('owner/:ownerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pets for a specific owner' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pets found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No pets found for this owner' })
  @ApiParam({ name: 'ownerId', description: 'Owner ID' })
  async findByOwner(@Param('ownerId', ParseUUIDPipe) ownerId: string, @Req() req) {
    // Role-based access control
    // Customers can only see their own pets
    if (req.user.role === 'customer' && req.user.id !== ownerId) {
      throw new BadRequestException('You can only view your own pets');
    }
    
    return this.petService.findByOwner(ownerId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pet by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pet found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet not found' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const pet = await this.petService.findById(id);
    
    // Role-based access control
    // Customers can only see their own pets
    if (req.user.role === 'customer' && pet.ownerId !== req.user.id) {
      throw new BadRequestException('You do not have permission to view this pet');
    }
    
    return pet;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pet by ID (owner or admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pet updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePetDto: UpdatePetDto,
    @Req() req,
  ) {
    const pet = await this.petService.findById(id);
    
    // Role-based access control
    // Customers can only update their own pets
    if (req.user.role === 'customer' && pet.ownerId !== req.user.id) {
      throw new BadRequestException('You can only update your own pets');
    }
    
    return this.petService.update(id, updatePetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete pet by ID (owner or admin)' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Pet deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Pet ID' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const pet = await this.petService.findById(id);
    
    // Role-based access control
    // Customers can only delete their own pets
    if (req.user.role === 'customer' && pet.ownerId !== req.user.id) {
      throw new BadRequestException('You can only delete your own pets');
    }
    
    await this.petService.remove(id);
    return;
  }
}
