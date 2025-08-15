import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Product } from './product.model';
import { ApiProperty } from '@nestjs/swagger';

@Table({
  tableName: 'product_categories',
  timestamps: true,
  paranoid: true,
})
export class ProductCategory extends Model {
  @ApiProperty({ description: 'Unique identifier for the product category' })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ description: 'Name of the product category' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ApiProperty({ description: 'Description of the product category' })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ApiProperty({ description: 'Image URL for the product category' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl: string;

  @ApiProperty({ description: 'Display order for sorting categories' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  displayOrder: number;

  @ApiProperty({ description: 'Whether the category is active and visible' })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  @ApiProperty({ description: 'Parent category ID for hierarchical categories' })
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  parentCategoryId: string;

  @ApiProperty({ description: 'Icon name/class for the category' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  iconName: string;

  // Relationships
  @HasMany(() => Product)
  products: Product[];
}
