import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsUUID,
  IsOptional,
  IsUrl,
  Min,
  Max,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ServiceCategory } from '../../../models/service.model';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Name of the service',
    example: 'Basic Dog Grooming',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the service',
    example: 'Full grooming service including bath, haircut, nail trimming, and ear cleaning',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price of the service',
    example: 49.99,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Duration of the service in minutes',
    example: 60,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(5)
  @Max(480) // Max 8 hours
  duration: number;

  @ApiProperty({
    description: 'Category of the service',
    enum: ServiceCategory,
    example: ServiceCategory.GROOMING,
  })
  @IsNotEmpty()
  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @ApiProperty({
    description: 'ID of the service provider (vendor)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'URL to image representing the service',
    example: 'https://example.com/images/dog-grooming.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Whether the service is currently active and available for booking',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Tags or keywords associated with the service for search and categorization',
    example: ['grooming', 'dog', 'haircut'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
