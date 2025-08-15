import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsNumber, IsOptional, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePetVaccinationDto } from './create-pet-vaccination.dto';
import { CreatePetMedicationDto } from './create-pet-medication.dto';

export class CreatePetHealthRecordDto {
  @ApiProperty({ description: 'Pet ID' })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({ description: 'Record date' })
  @IsDateString()
  recordDate: string;

  @ApiPropertyOptional({ description: 'Pet weight' })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Weight unit (kg or lb)' })
  @IsString()
  @IsOptional()
  weightUnit?: string;

  @ApiPropertyOptional({ description: 'General health notes' })
  @IsString()
  @IsOptional()
  generalHealth?: string;

  @ApiPropertyOptional({ description: 'Diet notes' })
  @IsString()
  @IsOptional()
  dietNotes?: string;

  @ApiPropertyOptional({ description: 'Behavior notes' })
  @IsString()
  @IsOptional()
  behaviorNotes?: string;

  @ApiPropertyOptional({ description: 'Exercise notes' })
  @IsString()
  @IsOptional()
  exerciseNotes?: string;

  @ApiPropertyOptional({ description: 'Symptoms notes' })
  @IsString()
  @IsOptional()
  symptomsNotes?: string;

  @ApiPropertyOptional({ description: 'Vet visit notes' })
  @IsString()
  @IsOptional()
  vetVisitNotes?: string;

  @ApiPropertyOptional({ description: 'Next checkup date' })
  @IsDateString()
  @IsOptional()
  nextCheckupDate?: string;

  @ApiPropertyOptional({ 
    description: 'Vital signs',
    type: 'object',
    example: {
      temperature: '38.5',
      heartRate: '80',
      respiratoryRate: '20',
    }
  })
  @IsObject()
  @IsOptional()
  vitalSigns?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Allergies',
    type: [String],
    example: ['Chicken', 'Wheat']
  })
  @IsArray()
  @IsOptional()
  allergies?: string[];

  @ApiPropertyOptional({ 
    description: 'Medical conditions',
    type: [String],
    example: ['Arthritis', 'Dental disease']
  })
  @IsArray()
  @IsOptional()
  conditions?: string[];

  @ApiPropertyOptional({ 
    description: 'Health-related photos URLs',
    type: [String]
  })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({ description: 'Vaccinations to add with this health record' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePetVaccinationDto)
  @IsOptional()
  vaccinations?: CreatePetVaccinationDto[];

  @ApiPropertyOptional({ description: 'Medications to add with this health record' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePetMedicationDto)
  @IsOptional()
  medications?: CreatePetMedicationDto[];
}
