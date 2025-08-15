import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ProductCategoryDto {
  @ApiProperty({ description: 'ID of the product category' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Name of the product category' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description of the product category', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL for the product category', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Display order for sorting categories', required: false })
  @IsInt()
  displayOrder: number;

  @ApiProperty({ description: 'Whether the category is active and visible' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Parent category ID for hierarchical categories', required: false })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiProperty({ description: 'Icon name/class for the category', required: false })
  @IsString()
  @IsOptional()
  iconName?: string;
}

export class CreateProductCategoryDto {
  @ApiProperty({ description: 'Name of the product category' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description of the product category', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL for the product category', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Display order for sorting categories', required: false, default: 0 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({ description: 'Whether the category is active and visible', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Parent category ID for hierarchical categories', required: false })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiProperty({ description: 'Icon name/class for the category', required: false })
  @IsString()
  @IsOptional()
  iconName?: string;
}

export class UpdateProductCategoryDto {
  @ApiProperty({ description: 'Name of the product category', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Description of the product category', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL for the product category', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Display order for sorting categories', required: false })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiProperty({ description: 'Whether the category is active and visible', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Parent category ID for hierarchical categories', required: false })
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  @ApiProperty({ description: 'Icon name/class for the category', required: false })
  @IsString()
  @IsOptional()
  iconName?: string;
}
