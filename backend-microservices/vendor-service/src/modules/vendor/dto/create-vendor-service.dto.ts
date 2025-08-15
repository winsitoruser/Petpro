import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsNumber, 
  IsPositive, 
  IsBoolean,
  IsOptional, 
  IsUrl, 
  IsUUID,
  IsArray,
  ArrayMinSize,
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '../../../models/vendor-service.model';

class PriceFactorDto {
  @ApiProperty({ example: 'small_dog' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @IsPositive()
  price: number;
}

class ServiceOptionDto {
  @ApiProperty({ example: 'Nail Trim' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 10.00 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: "Trim pet's nails" })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateVendorServiceDto {
  @ApiProperty({ 
    description: 'Reference to the vendor',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({
    description: 'Name of the service',
    example: 'Deluxe Pet Grooming',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the service',
    example: 'Full-service grooming includes bath, haircut, nail trimming, ear cleaning, and more.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Type of service',
    enum: ServiceType,
    example: ServiceType.GROOMING,
  })
  @IsEnum(ServiceType)
  @IsNotEmpty()
  type: ServiceType;

  @ApiProperty({
    description: 'Base price of the service',
    example: 49.99,
  })
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @ApiProperty({
    description: 'Duration of the service in minutes',
    example: 60,
  })
  @IsNumber()
  @IsPositive()
  durationMinutes: number;

  @ApiProperty({
    description: 'Whether the price varies based on pet size, breed, etc.',
    example: true,
  })
  @IsBoolean()
  variablePrice: boolean;

  @ApiProperty({
    description: 'Price factors (for variable pricing)',
    example: [
      { type: 'small_dog', price: 49.99 },
      { type: 'medium_dog', price: 59.99 },
      { type: 'large_dog', price: 79.99 }
    ],
    required: false,
    type: [PriceFactorDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceFactorDto)
  priceFactors?: PriceFactorDto[];

  @ApiProperty({
    description: 'Service image URL',
    example: 'https://storage.petpro.com/services/grooming-deluxe.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Is the service currently available',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Maximum number of pets per appointment',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maxPetsPerBooking?: number;

  @ApiProperty({
    description: 'Categories of pets this service is applicable for',
    example: ['dog', 'cat'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  petTypes: string[];

  @ApiProperty({
    description: 'Additional service options',
    example: [
      { name: 'Nail Trim', price: 10.00, description: "Trim pet's nails" },
      { name: 'Teeth Brushing', price: 15.00, description: "Clean pet's teeth" }
    ],
    required: false,
    type: [ServiceOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOptionDto)
  additionalOptions?: ServiceOptionDto[];
}
