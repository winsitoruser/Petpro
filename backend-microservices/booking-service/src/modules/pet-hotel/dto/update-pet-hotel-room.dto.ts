import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean, Min, MaxLength } from 'class-validator';
import { PetSize, PetType, RoomType } from '../../../models/pet-hotel/pet-hotel-room.model';

export class UpdatePetHotelRoomDto {
  @ApiPropertyOptional({ description: 'The room number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'The room name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ 
    description: 'The room type',
    enum: RoomType,
    example: RoomType.STANDARD
  })
  @IsEnum(RoomType)
  @IsOptional()
  roomType?: RoomType;

  @ApiPropertyOptional({ 
    description: 'The pet size allowed for this room',
    enum: PetSize,
    example: PetSize.ALL
  })
  @IsEnum(PetSize)
  @IsOptional()
  petSize?: PetSize;

  @ApiPropertyOptional({ 
    description: 'The pet type allowed for this room',
    enum: PetType,
    example: PetType.DOG
  })
  @IsEnum(PetType)
  @IsOptional()
  petType?: PetType;

  @ApiPropertyOptional({ 
    description: 'The room capacity',
    minimum: 1,
    default: 1
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ 
    description: 'The base price per night',
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  basePricePerNight?: number;

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
