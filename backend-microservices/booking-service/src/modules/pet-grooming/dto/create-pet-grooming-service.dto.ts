import { IsString, IsEnum, IsNumber, IsArray, IsBoolean, IsOptional, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PetType, SizeCategory } from '../../../models/pet-grooming/pet-grooming-service.model';

export class CreatePetGroomingServiceDto {
  @ApiProperty({ description: 'Name of the pet grooming service' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the pet grooming service' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Type of pet the service is for',
    enum: PetType,
  })
  @IsEnum(PetType)
  petType: PetType;

  @ApiPropertyOptional({ description: 'Breeds that are suitable for this service' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  suitableBreeds?: string[];

  @ApiProperty({ 
    description: 'Size category of pets for this service',
    enum: SizeCategory,
    default: SizeCategory.ALL
  })
  @IsEnum(SizeCategory)
  sizeCategory: SizeCategory;

  @ApiProperty({ 
    description: 'Base price of the service',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ 
    description: 'Duration of the service in minutes',
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiPropertyOptional({ description: 'Items included in the service' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedItems?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether the service requires an appointment',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  requiresAppointment?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether the service is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Categories this service belongs to' })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  categoryIds?: string[];
}
