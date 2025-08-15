import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUUID, IsNumber, IsOptional, IsArray, IsBoolean, Min, MaxLength, ValidateIf } from 'class-validator';
import { PetSize, PetType, RoomType } from '../../../models/pet-hotel/pet-hotel-room.model';

export class CreatePetHotelRoomDto {
  @ApiProperty({ description: 'The room number' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  roomNumber: string;

  @ApiProperty({ description: 'The room name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    description: 'The room type',
    enum: RoomType,
    example: RoomType.STANDARD
  })
  @IsEnum(RoomType)
  roomType: RoomType;

  @ApiProperty({ 
    description: 'The pet size allowed for this room',
    enum: PetSize,
    example: PetSize.ALL
  })
  @IsEnum(PetSize)
  petSize: PetSize;

  @ApiProperty({ 
    description: 'The pet type allowed for this room',
    enum: PetType,
    example: PetType.DOG
  })
  @IsEnum(PetType)
  petType: PetType;

  @ApiProperty({ 
    description: 'The room capacity',
    minimum: 1,
    default: 1
  })
  @IsNumber()
  @Min(1)
  capacity: number;

  @ApiProperty({ 
    description: 'The base price per night',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  basePricePerNight: number;

  @ApiPropertyOptional({ 
    description: 'The room description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'List of amenities',
    type: [String],
    example: ['Air conditioning', 'Daily walks', 'Bedding']
  })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional({ 
    description: 'List of photo URLs',
    type: [String]
  })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({ 
    description: 'Whether the room is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
