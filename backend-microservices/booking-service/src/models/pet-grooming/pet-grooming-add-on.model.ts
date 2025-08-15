import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Vendor } from '../vendor/vendor.model';
import { PetGroomingAppointmentAddOn } from './pet-grooming-appointment-add-on.model';

@Table({ 
  tableName: 'pet_grooming_add_ons',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetGroomingAddOn extends Model<PetGroomingAddOn> {
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
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  additionalDuration: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  // Relationships
  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @HasMany(() => PetGroomingAppointmentAddOn)
  appointmentAddOns: PetGroomingAppointmentAddOn[];
}
