import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

export class CreatePetDto {
  @ApiProperty({ description: 'Name of the pet' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Species of the pet (e.g., dog, cat)' })
  @IsString()
  species: string;

  @ApiPropertyOptional({ description: 'Breed of the pet' })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiPropertyOptional({ description: 'Birth date of the pet in ISO format' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ 
    description: 'Gender of the pet',
    enum: PetGender,
    default: PetGender.UNKNOWN
  })
  @IsEnum(PetGender)
  @IsOptional()
  gender?: PetGender;

  @ApiPropertyOptional({ 
    description: 'Weight of the pet in kilograms',
    minimum: 0.1,
    maximum: 500
  })
  @IsNumber()
  @Min(0.1)
  @Max(500)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Color of the pet' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'URL to the pet\'s photo' })
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Special needs of the pet' })
  @IsString()
  @IsOptional()
  specialNeeds?: string;

  @ApiPropertyOptional({ description: 'Allergies of the pet' })
  @IsString()
  @IsOptional()
  allergies?: string;

  @ApiPropertyOptional({ description: 'Medical conditions of the pet' })
  @IsString()
  @IsOptional()
  medicalConditions?: string;

  @ApiPropertyOptional({ description: 'Dietary requirements of the pet' })
  @IsString()
  @IsOptional()
  dietaryRequirements?: string;

  @ApiPropertyOptional({ description: 'Whether the pet is microchipped', default: false })
  @IsBoolean()
  @IsOptional()
  microchipped?: boolean;

  @ApiPropertyOptional({ description: 'Microchip ID of the pet if microchipped' })
  @IsString()
  @IsOptional()
  microchipId?: string;
}
