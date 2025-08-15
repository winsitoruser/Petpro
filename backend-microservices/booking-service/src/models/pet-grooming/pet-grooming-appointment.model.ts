import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { PetGroomingService } from './pet-grooming-service.model';
import { Vendor } from '../vendor/vendor.model';
import { PetGroomingAppointmentAddOn } from './pet-grooming-appointment-add-on.model';
import { PetGroomingPhoto } from './pet-grooming-photo.model';
import { Groomer } from './groomer.model';

export enum AppointmentStatus {
  BOOKED = 'booked',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Table({ 
  tableName: 'pet_grooming_appointments',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetGroomingAppointment extends Model<PetGroomingAppointment> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  petId: string;

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vendorId: string;

  @ForeignKey(() => PetGroomingService)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  serviceId: string;

  @ForeignKey(() => Groomer)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  groomerId: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  appointmentTime: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  durationMinutes: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  specialInstructions: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPrice: number;

  @Column({
    type: DataType.ENUM(...Object.values(AppointmentStatus)),
    allowNull: false,
    defaultValue: AppointmentStatus.BOOKED,
  })
  status: AppointmentStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  cancellationReason: string;

  // Relationships
  @BelongsTo(() => PetGroomingService)
  service: PetGroomingService;

  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @BelongsTo(() => Groomer)
  groomer: Groomer;

  @HasMany(() => PetGroomingAppointmentAddOn)
  addOns: PetGroomingAppointmentAddOn[];

  @HasMany(() => PetGroomingPhoto)
  photos: PetGroomingPhoto[];
}
