import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { ProductCategory } from './product-category.model';
import { Inventory } from './inventory.model';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
}

@Table({
  tableName: 'products',
  timestamps: true,
  paranoid: true,
})
export class Product extends Model {
  @ApiProperty({ description: 'Unique identifier for the product' })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ description: 'Name of the product' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ApiProperty({ description: 'Description of the product' })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ApiProperty({ description: 'Short description for product listings' })
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  shortDescription: string;

  @ApiProperty({ description: 'SKU (Stock Keeping Unit) for the product' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  sku: string;

  @ApiProperty({ description: 'UPC/Barcode for the product' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  barcode: string;

  @ApiProperty({ description: 'Regular price of the product' })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @ApiProperty({ description: 'Sale price of the product if on sale' })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  salePrice: number;

  @ApiProperty({ description: 'Cost price of the product' })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  costPrice: number;

  @ApiProperty({ description: 'Weight of the product in grams' })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  weight: number;

  @ApiProperty({ description: 'Length of the product in cm' })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  length: number;

  @ApiProperty({ description: 'Width of the product in cm' })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  width: number;

  @ApiProperty({ description: 'Height of the product in cm' })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  height: number;

  @ApiProperty({ description: 'Main image URL for the product' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  mainImageUrl: string;

  @ApiProperty({ description: 'Additional images for the product' })
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  additionalImages: string[];

  @ApiProperty({ description: 'Current status of the product' })
  @Column({
    type: DataType.ENUM(...Object.values(ProductStatus)),
    allowNull: false,
    defaultValue: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @ApiProperty({ description: 'Brand of the product' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  brand: string;

  @ApiProperty({ description: 'Whether the product is featured' })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isFeatured: boolean;

  @ApiProperty({ description: 'Whether the product is taxable' })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isTaxable: boolean;

  @ApiProperty({ description: 'Tax rate for the product if applicable' })
  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  taxRate: number;

  @ApiProperty({ description: 'Tags associated with the product' })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  tags: string[];

  @ApiProperty({ description: 'Pet types this product is suitable for' })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  petTypes: string[];

  @ApiProperty({ description: 'Metadata for the product' })
  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata: object;

  // Foreign keys
  @ApiProperty({ description: 'Category ID this product belongs to' })
  @ForeignKey(() => ProductCategory)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  categoryId: string;

  @ApiProperty({ description: 'Vendor ID that supplies this product' })
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  vendorId: string;

  // Relationships
  @BelongsTo(() => ProductCategory)
  category: ProductCategory;

  @HasMany(() => Inventory)
  inventories: Inventory[];
}
