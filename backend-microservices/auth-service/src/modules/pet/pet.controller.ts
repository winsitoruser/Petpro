import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from '../../models/pet.model';

@ApiTags('pets')
@Controller('pets')
@ApiBearerAuth()
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new pet' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pet created successfully', type: Pet })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid pet data' })
  async create(@Body() createPetDto: CreatePetDto, @Req() req): Promise<Pet> {
    return this.petService.create(req.user.id, createPetDto);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all pets for a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pets retrieved successfully', type: [Pet] })
  async findAllByUserId(@Param('userId') userId: string, @Req() req): Promise<Pet[]> {
    // Verify the user is accessing their own pets or has admin rights
    if (req.user.id !== userId && !req.user.roles?.includes('admin')) {
      throw new Error('You are not authorized to access these pets');
    }
    return this.petService.findAllByUserId(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all pets for the authenticated user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pets retrieved successfully', type: [Pet] })
  async findAll(@Req() req): Promise<Pet[]> {
    return this.petService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a pet by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pet retrieved successfully', type: Pet })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet not found' })
  async findOne(@Param('id') id: string, @Req() req): Promise<Pet> {
    const pet = await this.petService.findOne(id);
    
    // Verify the user is accessing their own pet or has admin rights
    if (pet.userId !== req.user.id && !req.user.roles?.includes('admin')) {
      throw new Error('You are not authorized to access this pet');
    }
    
    return pet;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a pet' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pet updated successfully', type: Pet })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto, @Req() req): Promise<Pet> {
    return this.petService.update(id, req.user.id, updatePetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pet' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Pet deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pet not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async remove(@Param('id') id: string, @Req() req): Promise<void> {
    return this.petService.remove(id, req.user.id);
  }
}
