import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Vendor } from '../vendor/vendor.model';
import { Groomer } from './groomer.model';

@Table({ 
  tableName: 'pet_grooming_availabilities',
  timestamps: true,
  paranoid: false
})
export class PetGroomingAvailability extends Model<PetGroomingAvailability> {
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

  @ForeignKey(() => Groomer)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  groomerId: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  availableDate: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  startTime: Date;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  endTime: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  maxAppointments: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  bookedAppointments: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isAvailable: boolean;

  // Relationships
  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @BelongsTo(() => Groomer)
  groomer: Groomer;
}
