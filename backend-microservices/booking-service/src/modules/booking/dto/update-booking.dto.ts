import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { BookingStatus, PaymentStatus } from '../../../models/booking.model';

export class UpdateBookingDto {
  @ApiProperty({
    description: 'Service ID being booked',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiProperty({
    description: 'Pet ID for which the service is being booked',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  petId?: string;

  @ApiProperty({
    description: 'Start time for the booking (ISO format)',
    example: '2025-09-15T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({
    description: 'Special requests or accommodations for the booking',
    example: 'My dog gets anxious, please handle with care.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialRequests?: string;

  @ApiProperty({
    description: 'Status of the booking',
    enum: BookingStatus,
    example: BookingStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({
    description: 'Payment status of the booking',
    enum: PaymentStatus,
    example: PaymentStatus.PAID,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({
    description: 'Staff member ID assigned to handle this booking',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  assignedStaffId?: string;
  
  @ApiProperty({
    description: 'Staff notes (not visible to customer)',
    example: 'Customer called to confirm details. Pet has special diet needs.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  staffNotes?: string;
}
