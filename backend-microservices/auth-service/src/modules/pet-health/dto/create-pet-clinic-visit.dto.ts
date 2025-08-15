import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsUUID, 
  IsDate, 
  IsOptional, 
  IsEnum, 
  IsNumber, 
  IsBoolean, 
  IsArray, 
  IsObject,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { VisitType, VisitStatus } from '../../../models/pet-health/pet-clinic-visit.model';

export class CreatePetClinicVisitDto {
  @ApiProperty({ description: 'Pet ID' })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({ description: 'Clinic name' })
  @IsString()
  @IsNotEmpty()
  clinicName: string;

  @ApiPropertyOptional({ description: 'Veterinarian name' })
  @IsString()
  @IsOptional()
  veterinarianName?: string;

  @ApiProperty({ description: 'Visit date' })
  @IsDate()
  @Type(() => Date)
  visitDate: Date;

  @ApiPropertyOptional({ description: 'Visit time (HH:MM format)' })
  @IsString()
  @IsOptional()
  visitTime?: string;

  @ApiProperty({ 
    description: 'Visit type',
    enum: VisitType,
    example: VisitType.ROUTINE_CHECKUP
  })
  @IsEnum(VisitType)
  visitType: VisitType;

  @ApiProperty({ 
    description: 'Visit status',
    enum: VisitStatus,
    example: VisitStatus.SCHEDULED,
    default: VisitStatus.SCHEDULED
  })
  @IsEnum(VisitStatus)
  @IsOptional()
  status?: VisitStatus = VisitStatus.SCHEDULED;

  @ApiPropertyOptional({ description: 'Chief complaint' })
  @IsString()
  @IsOptional()
  chiefComplaint?: string;

  @ApiPropertyOptional({ description: 'Diagnosis' })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Treatment notes' })
  @IsString()
  @IsOptional()
  treatmentNotes?: string;

  @ApiPropertyOptional({ description: 'Prescriptions' })
  @IsString()
  @IsOptional()
  prescriptions?: string;

  @ApiPropertyOptional({ description: 'Follow-up instructions' })
  @IsString()
  @IsOptional()
  followUpInstructions?: string;

  @ApiPropertyOptional({ description: 'Follow-up date' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  followUpDate?: Date;

  @ApiPropertyOptional({ description: 'Visit cost' })
  @IsNumber()
  @IsOptional()
  visitCost?: number;

  @ApiPropertyOptional({ 
    description: 'Whether the visit has been paid for',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean = false;

  @ApiPropertyOptional({ 
    description: 'Procedures performed during the visit',
    type: [String],
    example: ['Blood test', 'X-ray', 'Ultrasound']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  procedures?: string[];

  @ApiPropertyOptional({ 
    description: 'Laboratory results',
    type: 'array',
    example: [
      { 
        testName: 'Complete Blood Count', 
        date: '2023-05-15', 
        results: { 
          wbc: '10.5', 
          rbc: '7.2', 
          hgb: '15.1' 
        } 
      }
    ]
  })
  @IsArray()
  @IsObject({ each: true })
  @IsOptional()
  labResults?: Record<string, any>[];

  @ApiPropertyOptional({ 
    description: 'URLs to documents related to the visit',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];

  @ApiPropertyOptional({ 
    description: 'URLs to photos from the visit',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}
