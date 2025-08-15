import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { MedicationType, DosageUnit, Frequency } from '../../../models/pet-health/pet-medication.model';

export class CreatePetMedicationDto {
  @ApiProperty({ description: 'Pet ID' })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({ description: 'Medication name' })
  @IsString()
  @IsNotEmpty()
  medicationName: string;

  @ApiProperty({ 
    description: 'Medication type',
    enum: MedicationType,
    example: MedicationType.PRESCRIPTION
  })
  @IsEnum(MedicationType)
  medicationType: MedicationType;

  @ApiProperty({ description: 'Dosage amount' })
  @IsNumber()
  dosage: number;

  @ApiProperty({ 
    description: 'Dosage unit',
    enum: DosageUnit,
    example: DosageUnit.MG
  })
  @IsEnum(DosageUnit)
  dosageUnit: DosageUnit;

  @ApiProperty({ 
    description: 'Medication frequency',
    enum: Frequency,
    example: Frequency.DAILY
  })
  @IsEnum(Frequency)
  frequency: Frequency;

  @ApiProperty({ description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Administration instructions' })
  @IsString()
  @IsOptional()
  administrationInstructions?: string;

  @ApiPropertyOptional({ description: 'Prescribed by (veterinarian name)' })
  @IsString()
  @IsOptional()
  prescribedBy?: string;

  @ApiPropertyOptional({ description: 'Pharmacy name' })
  @IsString()
  @IsOptional()
  pharmacy?: string;

  @ApiPropertyOptional({ description: 'Prescription number' })
  @IsString()
  @IsOptional()
  prescriptionNumber?: string;

  @ApiPropertyOptional({ description: 'Number of refills' })
  @IsNumber()
  @IsOptional()
  refills?: number;

  @ApiPropertyOptional({ description: 'Purpose of medication' })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiPropertyOptional({ description: 'Notes about side effects' })
  @IsString()
  @IsOptional()
  sideEffectsNotes?: string;

  @ApiPropertyOptional({ description: 'Whether this medication is currently active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
