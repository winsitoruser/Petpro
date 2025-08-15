import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePetVaccinationDto {
  @ApiProperty({ description: 'Pet ID' })
  @IsUUID()
  @IsNotEmpty()
  petId: string;

  @ApiProperty({ description: 'Vaccine name' })
  @IsString()
  @IsNotEmpty()
  vaccineName: string;

  @ApiProperty({ description: 'Date administered' })
  @IsDateString()
  dateAdministered: string;

  @ApiPropertyOptional({ description: 'Vaccine manufacturer' })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Lot number' })
  @IsString()
  @IsOptional()
  lotNumber?: string;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @ApiPropertyOptional({ description: 'Administered by (veterinarian or technician name)' })
  @IsString()
  @IsOptional()
  administeredBy?: string;

  @ApiPropertyOptional({ description: 'Administered at (clinic name)' })
  @IsString()
  @IsOptional()
  administeredAt?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Whether this vaccination is required by law or regulation', default: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Whether this vaccination record is currently active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
