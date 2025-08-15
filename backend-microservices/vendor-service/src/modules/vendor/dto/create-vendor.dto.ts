import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsUrl,
  IsUUID,
  IsObject,
  ValidateNested,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';

class BusinessHoursDto {
  @ApiProperty({ example: '09:00', required: false })
  @IsOptional()
  @IsString()
  open: string;

  @ApiProperty({ example: '17:00', required: false })
  @IsOptional()
  @IsString()
  close: string;
}

export class CreateVendorDto {
  @ApiProperty({
    description: 'Vendor user ID (from auth service)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Happy Paws Veterinary Clinic',
  })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Full-service veterinary clinic specializing in small animals',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Business contact email',
    example: 'info@happypawsvet.com',
  })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiProperty({
    description: 'Business phone number',
    example: '+1-555-123-4567',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'Business website URL',
    example: 'https://www.happypawsvet.com',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({
    description: 'Business logo URL',
    example: 'https://storage.petpro.com/logos/happy-paws.png',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://storage.petpro.com/covers/happy-paws.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @ApiProperty({
    description: 'Apartment/Suite number',
    example: 'Suite 101',
    required: false,
  })
  @IsString()
  @IsOptional()
  aptSuite?: string;

  @ApiProperty({
    description: 'City',
    example: 'San Francisco',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'CA',
  })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '94107',
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 37.7749,
    required: false,
  })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -122.4194,
    required: false,
  })
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Business hours as JSON structure',
    example: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '15:00' },
      sunday: { open: null, close: null },
    },
    required: false,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessHoursDto)
  businessHours?: Record<string, BusinessHoursDto>;

  @ApiProperty({
    description: 'Tax ID / Business registration number',
    example: 'EIN-123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  taxId?: string;
}
