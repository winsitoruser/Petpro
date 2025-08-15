import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { BookingStatus, PaymentStatus } from '../../../models/booking.model';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Customer ID who is making the booking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @ApiProperty({
    description: 'Service ID being booked',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @ApiProperty({
    description: 'Pet ID for which the service is being booked',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsNotEmpty()
  @IsUUID()
  petId: string;

  @ApiProperty({
    description: 'Start time for the booking (ISO format)',
    example: '2025-09-15T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

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
    description: 'Initial status of the booking',
    enum: BookingStatus,
    example: BookingStatus.PENDING,
    default: BookingStatus.PENDING,
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiProperty({
    description: 'Initial payment status of the booking',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
    default: PaymentStatus.PENDING,
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
}
