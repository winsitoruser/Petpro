import { Column, DataType, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { BaseModel } from './base.model';
import { Vendor } from './vendor.model';

export enum ServiceType {
  GROOMING = 'grooming',
  VETERINARY = 'veterinary',
  BOARDING = 'boarding',
  DAYCARE = 'daycare',
  TRAINING = 'training',
  WALKING = 'walking',
  OTHER = 'other',
}

@Table({
  tableName: 'vendor_services',
  timestamps: true,
  underscored: true,
})
export class VendorService extends BaseModel<VendorService> {
  @ApiProperty({
    description: 'Reference to the vendor',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vendorId: string;

  @ApiProperty({
    description: 'Name of the service',
    example: 'Deluxe Pet Grooming',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @ApiProperty({
    description: 'Detailed description of the service',
    example: 'Full-service grooming includes bath, haircut, nail trimming, ear cleaning, and more.',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @ApiProperty({
    description: 'Type of service',
    enum: ServiceType,
    example: ServiceType.GROOMING,
  })
  @Column({
    type: DataType.ENUM(...Object.values(ServiceType)),
    allowNull: false,
  })
  type: ServiceType;

  @ApiProperty({
    description: 'Base price of the service',
    example: 49.99,
  })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  basePrice: number;

  @ApiProperty({
    description: 'Duration of the service in minutes',
    example: 60,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Whether the price varies based on pet size, breed, etc.',
    example: true,
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  })
  variablePrice: boolean;

  @ApiProperty({
    description: 'Price factors (for variable pricing)',
    example: `{
      "small_dog": 49.99,
      "medium_dog": 59.99,
      "large_dog": 79.99,
      "extra_large_dog": 99.99,
      "cats": 45.99
    }`,
  })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  priceFactors: Record<string, any>;

  @ApiProperty({
    description: 'Service image URL',
    example: 'https://storage.petpro.com/services/grooming-deluxe.jpg',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Is the service currently available',
    example: true,
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Maximum number of pets per appointment',
    example: 1,
  })
  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
    allowNull: false,
  })
  maxPetsPerBooking: number;

  @ApiProperty({
    description: 'Categories of pets this service is applicable for (e.g., dog, cat)',
    example: '["dog", "cat"]',
  })
  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: [],
  })
  petTypes: string[];

  @ApiProperty({
    description: 'Additional service options',
    example: `[
      {"name": "Nail Trim", "price": 10.00, "description": "Trim pet's nails"},
      {"name": "Teeth Brushing", "price": 15.00, "description": "Clean pet's teeth"}
    ]`,
  })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: [],
  })
  additionalOptions: Record<string, any>[];

  @BelongsTo(() => Vendor)
  vendor: Vendor;
}
