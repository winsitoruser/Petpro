import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsNumber, IsOptional, IsArray, IsObject, ValidateNested, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../../../models/pet-hotel/pet-hotel-booking.model';

class UpdateFeedingScheduleDto {
  @ApiPropertyOptional({ description: 'Time of feeding' })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiPropertyOptional({ description: 'Food type' })
  @IsString()
  @IsOptional()
  foodType?: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

class UpdateMedicationScheduleDto {
  @ApiPropertyOptional({ description: 'Time of medication' })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiPropertyOptional({ description: 'Medication name' })
  @IsString()
  @IsOptional()
  medicationName?: string;

  @ApiPropertyOptional({ description: 'Dosage' })
  @IsString()
  @IsOptional()
  dosage?: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class UpdatePetHotelBookingDto {
  @ApiPropertyOptional({ description: 'Pet ID' })
  @IsUUID()
  @IsOptional()
  petId?: string;

  @ApiPropertyOptional({ description: 'Room ID' })
  @IsUUID()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Check-in date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  checkInDate?: string;

  @ApiPropertyOptional({ description: 'Check-out date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @ApiPropertyOptional({ description: 'Expected check-in time (HH:MM)' })
  @IsString()
  @IsOptional()
  expectedCheckInTime?: string;

  @ApiPropertyOptional({ description: 'Expected check-out time (HH:MM)' })
  @IsString()
  @IsOptional()
  expectedCheckOutTime?: string;

  @ApiPropertyOptional({ 
    description: 'Booking status',
    enum: BookingStatus
  })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @ApiPropertyOptional({ 
    description: 'Pet items that will be brought along',
    type: 'object',
  })
  @IsObject()
  @IsOptional()
  petItems?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Feeding schedule',
    type: [UpdateFeedingScheduleDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFeedingScheduleDto)
  @IsOptional()
  feedingSchedule?: UpdateFeedingScheduleDto[];

  @ApiPropertyOptional({ 
    description: 'Medication schedule',
    type: [UpdateMedicationScheduleDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMedicationScheduleDto)
  @IsOptional()
  medicationSchedule?: UpdateMedicationScheduleDto[];

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}
