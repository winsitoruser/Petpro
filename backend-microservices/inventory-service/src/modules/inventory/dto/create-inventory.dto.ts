import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({ description: 'Product ID this inventory is for' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Current quantity in stock' })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Location identifier for inventory tracking', required: false })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiProperty({ description: 'Low stock threshold to trigger restock alerts', required: false, default: 5 })
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

  @ApiProperty({ description: 'Date when inventory was last counted/verified', required: false })
  @IsDateString()
  @IsOptional()
  lastStockCheckDate?: Date;

  @ApiProperty({ description: 'Notes about this inventory item', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Whether this inventory is available for sale', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ description: 'Reserved quantity (for pending orders)', required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  reservedQuantity?: number;
}
