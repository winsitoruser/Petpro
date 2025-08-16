import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ActivityType } from '../models/activity.model';

export class CreateActivityDto {
  @ApiProperty({
    description: 'User ID associated with the activity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Type of activity',
    enum: ActivityType,
    example: ActivityType.LOGIN,
  })
  @IsEnum(ActivityType)
  @IsNotEmpty()
  type: ActivityType;

  @ApiProperty({
    description: 'Description of the activity',
    example: 'User logged in from mobile device',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Additional metadata related to the activity',
    example: { device: 'iPhone', app_version: '1.2.3' },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'IP address of the request',
    example: '192.168.1.1',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent of the request',
    example: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Timestamp of the activity',
    example: '2023-09-15T12:34:56.789Z',
  })
  @IsDateString()
  @IsOptional()
  timestamp?: Date;
}
