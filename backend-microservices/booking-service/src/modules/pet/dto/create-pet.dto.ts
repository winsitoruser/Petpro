import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  MaxLength,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { PetType, PetSize } from '../../../models/pet.model';

export class CreatePetDto {
  @ApiProperty({
    description: 'Owner ID of the pet',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  ownerId: string;

  @ApiProperty({
    description: 'Name of the pet',
    example: 'Max',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Type of pet',
    enum: PetType,
    example: PetType.DOG,
  })
  @IsNotEmpty()
  @IsEnum(PetType)
  type: PetType;

  @ApiProperty({
    description: 'Breed of the pet',
    example: 'Golden Retriever',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  breed?: string;

  @ApiProperty({
    description: 'Size of the pet',
    enum: PetSize,
    example: PetSize.MEDIUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(PetSize)
  size?: PetSize;

  @ApiProperty({
    description: 'Birth date of the pet (ISO format)',
    example: '2020-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({
    description: 'Medical notes about the pet',
    example: 'Allergic to certain antibiotics',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  medicalNotes?: string;

  @ApiProperty({
    description: 'Whether the pet is up-to-date on vaccinations',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  vaccinated?: boolean;

  @ApiProperty({
    description: 'URL to the pet\'s profile image',
    example: 'https://example.com/pet-images/max.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
