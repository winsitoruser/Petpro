import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class InventoryDto {
  @ApiProperty({ description: 'ID of the inventory record' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Product ID this inventory is for' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Current quantity in stock' })
  @IsInt()
  quantity: number;

  @ApiProperty({ description: 'Location identifier for inventory tracking', required: false })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiProperty({ description: 'Low stock threshold to trigger restock alerts' })
  @IsInt()
  lowStockThreshold: number;

  @ApiProperty({ description: 'Shelf or bin location within warehouse', required: false })
  @IsString()
  @IsOptional()
  shelfLocation?: string;

  @ApiProperty({ description: 'Whether this inventory is available for sale' })
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({ description: 'Reserved quantity (for pending orders)' })
  @IsInt()
  reservedQuantity: number;

  @ApiProperty({ description: 'Last updated timestamp' })
  @IsDateString()
  updatedAt: Date;
}

export class UpdateInventoryDto {
  @ApiProperty({ description: 'Current quantity in stock', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Location identifier for inventory tracking', required: false })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiProperty({ description: 'Low stock threshold to trigger restock alerts', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;

  @ApiProperty({ description: 'Shelf or bin location within warehouse', required: false })
  @IsString()
  @IsOptional()
  shelfLocation?: string;

  @ApiProperty({ description: 'Batch or lot number for tracking', required: false })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ description: 'Expiration date if applicable', required: false })
  @IsDateString()
  @IsOptional()
  expirationDate?: Date;

  @ApiProperty({ description: 'Whether this inventory is available for sale', required: false })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Reserved quantity (for pending orders)', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  reservedQuantity?: number;
}

export class AdjustInventoryDto {
  @ApiProperty({ description: 'Quantity change (positive or negative)' })
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
