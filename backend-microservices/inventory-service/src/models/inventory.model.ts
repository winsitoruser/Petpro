import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Product } from './product.model';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'inventory',
  timestamps: true,
})
export class Inventory extends Model {
  @ApiProperty({ description: 'Unique identifier for the inventory record' })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ description: 'Product ID this inventory is for' })
  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  productId: string;

  @ApiProperty({ description: 'Current quantity in stock' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  quantity: number;

  @ApiProperty({ description: 'Location identifier for inventory tracking' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  locationId: string;

  @ApiProperty({ description: 'Low stock threshold to trigger restock alerts' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 5,
  })
  lowStockThreshold: number;

  @ApiProperty({ description: 'Shelf or bin location within warehouse' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  shelfLocation: string;

  @ApiProperty({ description: 'Batch or lot number for tracking' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  batchNumber: string;

  @ApiProperty({ description: 'Expiration date if applicable' })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expirationDate: Date;

  @ApiProperty({ description: 'Date when inventory was last counted/verified' })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastStockCheckDate: Date;

  @ApiProperty({ description: 'Notes about this inventory item' })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @ApiProperty({ description: 'Whether this inventory is available for sale' })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isAvailable: boolean;

  @ApiProperty({ description: 'Reserved quantity (for pending orders)' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  reservedQuantity: number;

  // Relationships
  @BelongsTo(() => Product)
  product: Product;
}
