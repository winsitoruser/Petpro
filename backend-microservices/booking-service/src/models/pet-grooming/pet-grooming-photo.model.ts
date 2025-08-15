import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { PetGroomingAppointment } from './pet-grooming-appointment.model';

export enum PhotoType {
  BEFORE = 'before',
  AFTER = 'after',
  DURING = 'during',
  OTHER = 'other',
}

@Table({ 
  tableName: 'pet_grooming_photos',
  timestamps: true,
  updatedAt: false,
})
export class PetGroomingPhoto extends Model<PetGroomingPhoto> {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  photoUrl: string;

  @Column({
    type: DataType.ENUM(...Object.values(PhotoType)),
    allowNull: false,
    defaultValue: PhotoType.OTHER,
  })
  photoType: PhotoType;

  // Relationships
  @BelongsTo(() => PetGroomingAppointment)
  appointment: PetGroomingAppointment;
}
