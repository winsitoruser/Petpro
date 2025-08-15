import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { PetGroomingAddOn } from './pet-grooming-add-on.model';
import { PetGroomingAppointment } from './pet-grooming-appointment.model';

@Table({ 
  tableName: 'pet_grooming_appointment_add_ons',
  timestamps: true,
  updatedAt: false,
})
export class PetGroomingAppointmentAddOn extends Model<PetGroomingAppointmentAddOn> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => PetGroomingAppointment)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  appointmentId: string;

  @ForeignKey(() => PetGroomingAddOn)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  addOnId: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  priceAtBooking: number;

  // Relationships
  @BelongsTo(() => PetGroomingAppointment)
  appointment: PetGroomingAppointment;

  @BelongsTo(() => PetGroomingAddOn)
  addOn: PetGroomingAddOn;
}
