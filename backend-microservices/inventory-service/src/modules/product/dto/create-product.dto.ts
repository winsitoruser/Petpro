import { ApiProperty } from '@nestjs/swagger';
import { 
  IsArray, 
  IsBoolean, 
  IsDecimal, 
  IsEnum, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsUUID, 
  MaxLength 
} from 'class-validator';
import { ProductStatus } from '../../../models/product.model';

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Short description for product listings', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  shortDescription?: string;

  @ApiProperty({ description: 'SKU (Stock Keeping Unit) for the product' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @ApiProperty({ description: 'UPC/Barcode for the product', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({ description: 'Regular price of the product' })
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'Sale price of the product if on sale', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  salePrice?: number;

  @ApiProperty({ description: 'Cost price of the product', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  costPrice?: number;

  @ApiProperty({ description: 'Weight of the product in grams', required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Length of the product in cm', required: false })
  @IsNumber()
  @IsOptional()
  length?: number;

  @ApiProperty({ description: 'Width of the product in cm', required: false })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({ description: 'Height of the product in cm', required: false })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({ description: 'Main image URL for the product', required: false })
  @IsString()
  @IsOptional()
  mainImageUrl?: string;

  @ApiProperty({ description: 'Additional images for the product', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  additionalImages?: string[];

  @ApiProperty({ description: 'Current status of the product', enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ description: 'Brand of the product', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ description: 'Whether the product is featured', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ description: 'Whether the product is taxable', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isTaxable?: boolean;

  @ApiProperty({ description: 'Tax rate for the product if applicable', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  taxRate?: number;

  @ApiProperty({ description: 'Tags associated with the product', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Pet types this product is suitable for', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  petTypes?: string[];

  @ApiProperty({ description: 'Category ID this product belongs to' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Vendor ID that supplies this product', required: false })
  @IsUUID()
  @IsOptional()
  vendorId?: string;
}
