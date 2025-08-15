import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { RecurrencePattern } from '../../../models/service-availability.model';

export class UpdateAvailabilityDto {
  @ApiProperty({
    description: 'Start time of the availability slot (ISO format)',
    example: '2025-09-15T09:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({
    description: 'End time of the availability slot (ISO format)',
    example: '2025-09-15T17:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({
    description: 'Maximum number of slots available in this time period',
    example: 8,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSlots?: number;

  @ApiProperty({
    description: 'Number of slots already booked in this time period',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bookedSlots?: number;

  @ApiProperty({
    description: 'Is this a recurring availability slot?',
    example: true,
    required: false,
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
