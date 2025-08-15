import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { RecurrencePattern } from '../../../models/service-availability.model';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Service ID that this availability slot belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'Start time of the availability slot (ISO format)',
    example: '2025-09-15T09:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'End time of the availability slot (ISO format)',
    example: '2025-09-15T17:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Maximum number of slots available in this time period',
    example: 8,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSlots?: number;

  @ApiProperty({
    description: 'Number of slots already booked in this time period',
    example: 0,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bookedSlots?: number;

  @ApiProperty({
    description: 'Is this a recurring availability slot?',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    description: 'Recurrence pattern if recurring',
    enum: RecurrencePattern,
    example: RecurrencePattern.WEEKLY,
    required: false,
  })
  @ValidateIf(o => o.isRecurring === true)
  @IsEnum(RecurrencePattern)
  recurrencePattern?: RecurrencePattern;

  @ApiProperty({
    description: 'End date of recurrence (ISO format)',
    example: '2025-12-31T23:59:59Z',
    required: false,
  })
  @ValidateIf(o => o.isRecurring === true)
  @IsDateString()
  recurrenceEndDate?: string;

  @ApiProperty({
    description: 'Additional notes for this availability slot',
    example: 'Lunch break between 12-1pm',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
