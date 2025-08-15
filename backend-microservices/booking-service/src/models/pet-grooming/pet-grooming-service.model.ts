import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Vendor } from '../vendor/vendor.model';
import { PetGroomingAppointment } from './pet-grooming-appointment.model';
import { PetGroomingServiceMapping } from './pet-grooming-service-mapping.model';

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  SMALL_ANIMAL = 'small_animal',
  BIRD = 'bird',
  ALL = 'all',
}

export enum SizeCategory {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ALL = 'all',
}

@Table({ 
  tableName: 'pet_grooming_services',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetGroomingService extends Model<PetGroomingService> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vendorId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(PetType)),
    allowNull: false,
  })
  petType: PetType;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  suitableBreeds: string[];

  @Column({
    type: DataType.ENUM(...Object.values(SizeCategory)),
    allowNull: false,
    defaultValue: SizeCategory.ALL,
  })
  sizeCategory: SizeCategory;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  basePrice: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  durationMinutes: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  includedItems: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  requiresAppointment: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  // Relationships
  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @HasMany(() => PetGroomingAppointment)
  appointments: PetGroomingAppointment[];

  @HasMany(() => PetGroomingServiceMapping)
  categoryMappings: PetGroomingServiceMapping[];
}
