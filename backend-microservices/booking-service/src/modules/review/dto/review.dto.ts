import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, IsString, IsBoolean, IsOptional, Min, Max, Length } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Booking ID to review', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID(4)
  bookingId: string;

  @ApiProperty({ description: 'Rating (1-5)', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review content', example: 'Great service, my pet was well taken care of!' })
  @IsString()
  @Length(1, 2000)
  review: string;

  @ApiPropertyOptional({ description: 'Whether to hide customer name', default: false })
  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Rating (1-5)', example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Review content', example: 'Updated review text' })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  review?: string;

  @ApiPropertyOptional({ description: 'Whether to hide customer name', example: true })
  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;
}

export class ReviewFilterDto {
  @ApiPropertyOptional({ 
    description: 'Sort order', 
    enum: ['recent', 'helpful', 'rating_high', 'rating_low'],
    default: 'recent'
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by rating', 
    enum: ['all', 'positive', 'negative', 'neutral'],
    default: 'all'
  })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({ description: 'Maximum number of reviews to return', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
