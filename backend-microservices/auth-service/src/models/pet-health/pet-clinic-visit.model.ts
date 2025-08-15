import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Pet } from '../pet.model';

export enum VisitType {
  ROUTINE_CHECKUP = 'routine_checkup',
  EMERGENCY = 'emergency',
  FOLLOW_UP = 'follow_up',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  DENTAL = 'dental',
  SPECIALIST_CONSULTATION = 'specialist_consultation',
  OTHER = 'other',
}

export enum VisitStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Table({ 
  tableName: 'pet_clinic_visits',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetClinicVisit extends Model<PetClinicVisit> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Pet)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  petId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  clinicName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  veterinarianName: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  visitDate: Date;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  visitTime: string;

  @Column({
    type: DataType.ENUM(...Object.values(VisitType)),
    allowNull: false,
    defaultValue: VisitType.ROUTINE_CHECKUP,
  })
  visitType: VisitType;

  @Column({
    type: DataType.ENUM(...Object.values(VisitStatus)),
    allowNull: false,
    defaultValue: VisitStatus.SCHEDULED,
  })
  status: VisitStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  chiefComplaint: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  diagnosis: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  treatmentNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  prescriptions: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  followUpInstructions: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  followUpDate: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  visitCost: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isPaid: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  procedures: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  labResults: object[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  documents: string[]; // URLs to documents/files

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  photos: string[]; // URLs to photos from the visit

  @BelongsTo(() => Pet)
  pet: Pet;
}
