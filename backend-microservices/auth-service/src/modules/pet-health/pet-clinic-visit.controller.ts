import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PetClinicVisitService } from './pet-clinic-visit.service';
import { CreatePetClinicVisitDto } from './dto/create-pet-clinic-visit.dto';
import { PetClinicVisit, VisitStatus } from '../../models/pet-health/pet-clinic-visit.model';
import { PetOwnershipGuard } from '../pet/guards/pet-ownership.guard';

@ApiTags('pet-clinic-visits')
@Controller('pet-clinic-visits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PetClinicVisitController {
  constructor(private readonly petClinicVisitService: PetClinicVisitService) {}

  @Post()
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Create a new pet clinic visit' })
  @ApiResponse({ status: 201, description: 'Clinic visit created successfully', type: PetClinicVisit })
  async create(@Body() createPetClinicVisitDto: CreatePetClinicVisitDto): Promise<PetClinicVisit> {
    return this.petClinicVisitService.create(createPetClinicVisitDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pet clinic visits' })
  @ApiQuery({ name: 'petId', required: false, description: 'Filter by pet ID' })
  @ApiResponse({ status: 200, description: 'Clinic visits retrieved successfully', type: [PetClinicVisit] })
  async findAll(@Query('petId') petId?: string): Promise<PetClinicVisit[]> {
    return this.petClinicVisitService.findAll(petId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet clinic visit by id' })
  @ApiResponse({ status: 200, description: 'Clinic visit retrieved successfully', type: PetClinicVisit })
  @ApiResponse({ status: 404, description: 'Clinic visit not found' })
  async findOne(@Param('id') id: string): Promise<PetClinicVisit> {
    return this.petClinicVisitService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Update a pet clinic visit' })
  @ApiResponse({ status: 200, description: 'Clinic visit updated successfully', type: PetClinicVisit })
  @ApiResponse({ status: 404, description: 'Clinic visit not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePetClinicVisitDto: Partial<CreatePetClinicVisitDto>,
  ): Promise<PetClinicVisit> {
    return this.petClinicVisitService.update(id, updatePetClinicVisitDto);
  }

  @Delete(':id')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Delete a pet clinic visit' })
  @ApiResponse({ status: 200, description: 'Clinic visit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Clinic visit not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.petClinicVisitService.remove(id);
  }

  @Patch(':id/status')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Update a pet clinic visit status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: PetClinicVisit })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Clinic visit not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: VisitStatus,
  ): Promise<PetClinicVisit> {
    return this.petClinicVisitService.updateStatus(id, status);
  }

  @Get('history/:petId')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Get pet clinic visit history' })
  @ApiResponse({ status: 200, description: 'Clinic history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async getPetClinicHistory(@Param('petId') petId: string): Promise<any> {
    return this.petClinicVisitService.getPetClinicHistory(petId);
  }
}
