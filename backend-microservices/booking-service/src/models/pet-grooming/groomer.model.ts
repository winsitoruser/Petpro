import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Vendor } from '../vendor/vendor.model';
import { PetGroomingAppointment } from './pet-grooming-appointment.model';
import { PetGroomingAvailability } from './pet-grooming-availability.model';

@Table({ 
  tableName: 'groomers',
  timestamps: true,
  paranoid: true // Soft delete
})
export class Groomer extends Model<Groomer> {
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
    type: DataType.STRING,
    allowNull: true,
  })
  profileImage: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  specializations: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: {},
  })
  workingHours: object;

  // Relationships
  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @HasMany(() => PetGroomingAppointment)
  appointments: PetGroomingAppointment[];

  @HasMany(() => PetGroomingAvailability)
  availabilities: PetGroomingAvailability[];
}
