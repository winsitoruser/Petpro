import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PetHealthRecordService } from './pet-health-record.service';
import { CreatePetHealthRecordDto } from './dto/create-pet-health-record.dto';
import { CreatePetVaccinationDto } from './dto/create-pet-vaccination.dto';
import { CreatePetMedicationDto } from './dto/create-pet-medication.dto';
import { PetHealthRecord } from '../../models/pet-health/pet-health-record.model';
import { PetVaccination } from '../../models/pet-health/pet-vaccination.model';
import { PetMedication } from '../../models/pet-health/pet-medication.model';
import { PetOwnershipGuard } from '../pet/guards/pet-ownership.guard';

@ApiTags('pet-health-records')
@Controller('pet-health-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PetHealthRecordController {
  constructor(private readonly petHealthRecordService: PetHealthRecordService) {}

  @Post()
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Create a new pet health record' })
  @ApiResponse({ status: 201, description: 'Health record created successfully', type: PetHealthRecord })
  async create(@Body() createPetHealthRecordDto: CreatePetHealthRecordDto): Promise<PetHealthRecord> {
    return this.petHealthRecordService.create(createPetHealthRecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pet health records' })
  @ApiQuery({ name: 'petId', required: false, description: 'Filter by pet ID' })
  @ApiResponse({ status: 200, description: 'Health records retrieved successfully', type: [PetHealthRecord] })
  async findAll(@Query('petId') petId?: string): Promise<PetHealthRecord[]> {
    return this.petHealthRecordService.findAll(petId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet health record by id' })
  @ApiResponse({ status: 200, description: 'Health record retrieved successfully', type: PetHealthRecord })
  @ApiResponse({ status: 404, description: 'Health record not found' })
  async findOne(@Param('id') id: string): Promise<PetHealthRecord> {
    return this.petHealthRecordService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Update a pet health record' })
  @ApiResponse({ status: 200, description: 'Health record updated successfully', type: PetHealthRecord })
  @ApiResponse({ status: 404, description: 'Health record not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePetHealthRecordDto: Partial<CreatePetHealthRecordDto>,
  ): Promise<PetHealthRecord> {
    return this.petHealthRecordService.update(id, updatePetHealthRecordDto);
  }

  @Delete(':id')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Delete a pet health record' })
  @ApiResponse({ status: 200, description: 'Health record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Health record not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.petHealthRecordService.remove(id);
  }

  // Dashboard data
  @Get('dashboard/:petId')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Get pet health dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async getPetHealthDashboard(@Param('petId') petId: string): Promise<any> {
    return this.petHealthRecordService.getPetHealthDashboard(petId);
  }

  // Vaccination endpoints
  @Post('vaccinations')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Create a new pet vaccination' })
  @ApiResponse({ status: 201, description: 'Vaccination created successfully', type: PetVaccination })
  async createVaccination(@Body() createVaccinationDto: CreatePetVaccinationDto): Promise<PetVaccination> {
    return this.petHealthRecordService.createVaccination(createVaccinationDto);
  }

  @Get('vaccinations')
  @ApiOperation({ summary: 'Get all pet vaccinations' })
  @ApiQuery({ name: 'petId', required: false, description: 'Filter by pet ID' })
  @ApiResponse({ status: 200, description: 'Vaccinations retrieved successfully', type: [PetVaccination] })
  async findVaccinations(@Query('petId') petId?: string): Promise<PetVaccination[]> {
    return this.petHealthRecordService.findVaccinations(petId);
  }

  @Get('vaccinations/:id')
  @ApiOperation({ summary: 'Get a pet vaccination by id' })
  @ApiResponse({ status: 200, description: 'Vaccination retrieved successfully', type: PetVaccination })
  @ApiResponse({ status: 404, description: 'Vaccination not found' })
  async findVaccinationById(@Param('id') id: string): Promise<PetVaccination> {
    return this.petHealthRecordService.findVaccinationById(id);
  }

  @Patch('vaccinations/:id')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Update a pet vaccination' })
  @ApiResponse({ status: 200, description: 'Vaccination updated successfully', type: PetVaccination })
  @ApiResponse({ status: 404, description: 'Vaccination not found' })
  async updateVaccination(
    @Param('id') id: string,
    @Body() updateVaccinationDto: Partial<CreatePetVaccinationDto>,
  ): Promise<PetVaccination> {
    return this.petHealthRecordService.updateVaccination(id, updateVaccinationDto);
  }

  @Delete('vaccinations/:id')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Delete a pet vaccination' })
  @ApiResponse({ status: 200, description: 'Vaccination deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vaccination not found' })
  async removeVaccination(@Param('id') id: string): Promise<void> {
    return this.petHealthRecordService.removeVaccination(id);
  }

  // Medication endpoints
  @Post('medications')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Create a new pet medication' })
  @ApiResponse({ status: 201, description: 'Medication created successfully', type: PetMedication })
  async createMedication(@Body() createMedicationDto: CreatePetMedicationDto): Promise<PetMedication> {
    return this.petHealthRecordService.createMedication(createMedicationDto);
  }

  @Get('medications')
  @ApiOperation({ summary: 'Get all pet medications' })
  @ApiQuery({ name: 'petId', required: false, description: 'Filter by pet ID' })
  @ApiResponse({ status: 200, description: 'Medications retrieved successfully', type: [PetMedication] })
  async findMedications(@Query('petId') petId?: string): Promise<PetMedication[]> {
    return this.petHealthRecordService.findMedications(petId);
  }

  @Get('medications/:id')
  @ApiOperation({ summary: 'Get a pet medication by id' })
  @ApiResponse({ status: 200, description: 'Medication retrieved successfully', type: PetMedication })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async findMedicationById(@Param('id') id: string): Promise<PetMedication> {
    return this.petHealthRecordService.findMedicationById(id);
  }

  @Patch('medications/:id')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Update a pet medication' })
  @ApiResponse({ status: 200, description: 'Medication updated successfully', type: PetMedication })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async updateMedication(
    @Param('id') id: string,
    @Body() updateMedicationDto: Partial<CreatePetMedicationDto>,
  ): Promise<PetMedication> {
    return this.petHealthRecordService.updateMedication(id, updateMedicationDto);
  }

  @Delete('medications/:id')
  @UseGuards(PetOwnershipGuard)
  @ApiOperation({ summary: 'Delete a pet medication' })
  @ApiResponse({ status: 200, description: 'Medication deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async removeMedication(@Param('id') id: string): Promise<void> {
    return this.petHealthRecordService.removeMedication(id);
  }
}
