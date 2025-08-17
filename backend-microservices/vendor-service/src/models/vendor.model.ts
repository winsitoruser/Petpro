import { Column, DataType, Table, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { BaseModel } from './base.model';
import { VendorService } from './vendor-service.model';

export enum VendorStatus {
  PENDING = 'pending',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

@Table({
  tableName: 'vendors',
  timestamps: true,
  underscored: true,
})
export class Vendor extends BaseModel<Vendor> {
  @ApiProperty({
    description: 'Vendor user ID (from auth service)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  userId: string;

  @ApiProperty({
    description: 'Business name',
    example: 'Happy Paws Veterinary Clinic',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  businessName: string;

  @ApiProperty({
    description: 'Business description',
    example: 'Full-service veterinary clinic specializing in small animals',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ApiProperty({
    description: 'Business contact email',
    example: 'info@happypawsvet.com',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  })
  contactEmail: string;

  @ApiProperty({
    description: 'Business phone number',
    example: '+1-555-123-4567',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Business website URL',
    example: 'https://www.happypawsvet.com',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isUrl: true,
    },
  })
  website: string;

  @ApiProperty({
    description: 'Business logo URL',
    example: 'https://storage.petpro.com/logos/happy-paws.png',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  logoUrl: string;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://storage.petpro.com/covers/happy-paws.jpg',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  coverImageUrl: string;

  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  streetAddress: string;

  @ApiProperty({
    description: 'Apartment/Suite number',
    example: 'Suite 101',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  aptSuite: string;

  @ApiProperty({
    description: 'City',
    example: 'San Francisco',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'CA',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '94107',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  country: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 37.7749,
  })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: -122.4194,
  })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  longitude: number;

  @ApiProperty({
    description: 'Business hours as JSON structure',
    example: `{
      "monday": {"open": "09:00", "close": "17:00"},
      "tuesday": {"open": "09:00", "close": "17:00"},
      "wednesday": {"open": "09:00", "close": "17:00"},
      "thursday": {"open": "09:00", "close": "17:00"},
      "friday": {"open": "09:00", "close": "17:00"},
      "saturday": {"open": "10:00", "close": "15:00"},
      "sunday": {"open": null, "close": null}
    }`,
  })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
  })
  businessHours: Record<string, any>;

  @ApiProperty({
    description: 'Tax ID / Business registration number',
    example: 'EIN-123456789',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  taxId: string;

  @ApiProperty({
    description: 'Vendor verification status',
    enum: VendorStatus,
    example: VendorStatus.ACTIVE,
  })
  @Column({
    type: DataType.ENUM(...Object.values(VendorStatus)),
    allowNull: false,
    defaultValue: VendorStatus.PENDING,
  })
  status: VendorStatus;

  @ApiProperty({
    description: 'Account verification date',
    example: '2023-01-15T14:30:00Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  verifiedAt: Date;

  @ApiProperty({
    description: 'Average rating (1-5 stars)',
    example: 4.8,
  })
  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5,
    },
  })
  averageRating: number;

  @ApiProperty({
    description: 'Total number of ratings received',
    example: 243,
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 0,
  })
  ratingCount: number;

  @ApiProperty({
    description: 'Date when the account was deactivated',
    example: null,
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deactivatedAt: Date;

  // Define relationships
  @HasMany(() => VendorService)
  services: VendorService[];
}
