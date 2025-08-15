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

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  DISCONTINUED = 'DISCONTINUED',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export class ProductDto {
  @ApiProperty({ description: 'ID of the product' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Short description for product listings', required: false })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiProperty({ description: 'SKU (Stock Keeping Unit) for the product' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'UPC/Barcode for the product', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ description: 'Regular price of the product' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Sale price of the product if on sale', required: false })
  @IsNumber()
  @IsOptional()
  salePrice?: number;

  @ApiProperty({ description: 'Weight of the product in grams', required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Main image URL for the product', required: false })
  @IsString()
  @IsOptional()
  mainImageUrl?: string;

  @ApiProperty({ description: 'Additional images for the product', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  additionalImages?: string[];

  @ApiProperty({ description: 'Current status of the product', enum: ProductStatus })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiProperty({ description: 'Brand of the product', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ description: 'Whether the product is featured' })
  @IsBoolean()
  isFeatured: boolean;

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
  categoryId: string;

  @ApiProperty({ description: 'Vendor ID that supplies this product', required: false })
  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @ApiProperty({ description: 'Current inventory quantity' })
  @IsNumber()
  @IsOptional()
  inventoryQuantity?: number;
}

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

  @ApiProperty({ description: 'Initial inventory quantity', required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  initialQuantity?: number;
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Name of the product', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Short description for product listings', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  shortDescription?: string;

  @ApiProperty({ description: 'SKU (Stock Keeping Unit) for the product', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sku?: string;

  @ApiProperty({ description: 'UPC/Barcode for the product', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @ApiProperty({ description: 'Regular price of the product', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Sale price of the product if on sale', required: false })
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  salePrice?: number;

  @ApiProperty({ description: 'Weight of the product in grams', required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Main image URL for the product', required: false })
  @IsString()
  @IsOptional()
  mainImageUrl?: string;

  @ApiProperty({ description: 'Additional images for the product', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  additionalImages?: string[];

  @ApiProperty({ description: 'Current status of the product', enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ description: 'Brand of the product', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ description: 'Whether the product is featured', required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiProperty({ description: 'Tags associated with the product', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ description: 'Pet types this product is suitable for', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  petTypes?: string[];

  @ApiProperty({ description: 'Category ID this product belongs to', required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Vendor ID that supplies this product', required: false })
  @IsUUID()
  @IsOptional()
  vendorId?: string;
}
