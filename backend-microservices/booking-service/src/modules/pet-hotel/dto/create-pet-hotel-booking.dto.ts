import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUUID, IsDateString, IsNumber, IsOptional, IsArray, IsObject, ValidateNested, Min, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../../../models/pet-hotel/pet-hotel-booking.model';

class FeedingScheduleDto {
  @ApiProperty({ description: 'Time of feeding' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ description: 'Food type' })
  @IsString()
  @IsNotEmpty()
  foodType: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

class MedicationScheduleDto {
  @ApiProperty({ description: 'Time of medication' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ description: 'Medication name' })
  @IsString()
  @IsNotEmpty()
  medicationName: string;

  @ApiProperty({ description: 'Dosage' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

class BookingServiceDto {
  @ApiProperty({ description: 'Service ID' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ description: 'Quantity', default: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Scheduled time for the service' })
  @IsDateString()
  @IsOptional()
  scheduledTime?: string;

  @ApiPropertyOptional({ description: 'Special notes for this service' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePetHotelBookingDto {
  @ApiProperty({ description: 'Pet ID' })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({ description: 'Room ID' })
  @IsUUID()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ description: 'Check-in date (YYYY-MM-DD)' })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({ description: 'Check-out date (YYYY-MM-DD)' })
  @IsDateString()
  checkOutDate: string;

  @ApiPropertyOptional({ description: 'Expected check-in time (HH:MM)' })
  @IsString()
  @IsOptional()
  expectedCheckInTime?: string;

  @ApiPropertyOptional({ description: 'Expected check-out time (HH:MM)' })
  @IsString()
  @IsOptional()
  expectedCheckOutTime?: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @ApiPropertyOptional({ 
    description: 'Pet items that will be brought along',
    type: 'object',
    example: { 
      toys: ['Ball', 'Chew toy'],
      bedding: 'Yes',
      foodSupplied: true,
      foodAmount: '2 cups per day'
    } 
  })
  @IsObject()
  @IsOptional()
  petItems?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Feeding schedule',
    type: [FeedingScheduleDto],
    example: [
      { time: '08:00', foodType: 'Dry food', instructions: '1 cup' },
      { time: '18:00', foodType: 'Wet food', instructions: '1/2 can' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedingScheduleDto)
  @IsOptional()
  feedingSchedule?: FeedingScheduleDto[];

  @ApiPropertyOptional({ 
    description: 'Medication schedule',
    type: [MedicationScheduleDto],
    example: [
      { time: '09:00', medicationName: 'Antibiotic', dosage: '1 pill', instructions: 'With food' }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationScheduleDto)
  @IsOptional()
  medicationSchedule?: MedicationScheduleDto[];

  @ApiPropertyOptional({ 
    description: 'Additional services to book with the stay',
    type: [BookingServiceDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingServiceDto)
  @IsOptional()
  services?: BookingServiceDto[];
}
