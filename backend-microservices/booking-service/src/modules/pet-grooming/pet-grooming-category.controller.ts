import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PetGroomingCategoryService } from './pet-grooming-category.service';
import { PetGroomingServiceCategory } from '../../models/pet-grooming/pet-grooming-service-category.model';

@ApiTags('pet-grooming-categories')
@Controller('pet-grooming-categories')
export class PetGroomingCategoryController {
  constructor(private readonly petGroomingCategoryService: PetGroomingCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new pet grooming service category' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Category created successfully', type: PetGroomingServiceCategory })
  async create(@Body() createCategoryDto: {
    name: string;
    description?: string;
    icon?: string;
  }): Promise<PetGroomingServiceCategory> {
    return this.petGroomingCategoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pet grooming service categories' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categories retrieved successfully', type: [PetGroomingServiceCategory] })
  async findAll(): Promise<PetGroomingServiceCategory[]> {
    return this.petGroomingCategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet grooming service category by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category retrieved successfully', type: PetGroomingServiceCategory })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async findOne(@Param('id') id: string): Promise<PetGroomingServiceCategory> {
    return this.petGroomingCategoryService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a pet grooming service category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Category updated successfully', type: PetGroomingServiceCategory })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateCategoryDto: {
      name?: string;
      description?: string;
      icon?: string;
    }
  ): Promise<PetGroomingServiceCategory> {
    return this.petGroomingCategoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pet grooming service category' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Category deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Category not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.petGroomingCategoryService.remove(id);
  }
}
