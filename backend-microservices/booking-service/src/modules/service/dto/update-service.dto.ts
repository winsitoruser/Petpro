import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsUrl,
  Min,
  Max,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ServiceCategory } from '../../../models/service.model';

export class UpdateServiceDto {
  @ApiProperty({
    description: 'Name of the service',
    example: 'Premium Dog Grooming',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Detailed description of the service',
    example: 'Deluxe grooming service including bath, haircut, nail trimming, and specialized treatments',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price of the service',
    example: 69.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'Duration of the service in minutes',
    example: 90,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480) // Max 8 hours
  duration?: number;

  @ApiProperty({
    description: 'Category of the service',
    enum: ServiceCategory,
    example: ServiceCategory.GROOMING,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceCategory)
  category?: ServiceCategory;

  @ApiProperty({
    description: 'URL to image representing the service',
    example: 'https://example.com/images/premium-dog-grooming.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Whether the service is currently active and available for booking',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Tags or keywords associated with the service for search and categorization',
    example: ['premium', 'grooming', 'dog', 'deluxe'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
