import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Pet } from '../pet.model';
import { PetHealthRecord } from './pet-health-record.model';

export enum MedicationType {
  PRESCRIPTION = 'prescription',
  OVER_THE_COUNTER = 'over_the_counter',
  SUPPLEMENT = 'supplement',
  HERBAL = 'herbal',
}

export enum DosageUnit {
  MG = 'mg',
  ML = 'ml',
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  DROP = 'drop',
  TEASPOON = 'teaspoon',
  TABLESPOON = 'tablespoon',
  PATCH = 'patch',
  UNIT = 'unit',
  OTHER = 'other',
}

export enum Frequency {
  ONCE = 'once',
  DAILY = 'daily',
  TWICE_DAILY = 'twice_daily',
  THREE_TIMES_DAILY = 'three_times_daily',
  FOUR_TIMES_DAILY = 'four_times_daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  AS_NEEDED = 'as_needed',
}

@Table({ 
  tableName: 'pet_medications',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetMedication extends Model<PetMedication> {
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

  @ForeignKey(() => PetHealthRecord)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  healthRecordId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  medicationName: string;

  @Column({
    type: DataType.ENUM(...Object.values(MedicationType)),
    allowNull: false,
    defaultValue: MedicationType.PRESCRIPTION,
  })
  medicationType: MedicationType;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  dosage: number;

  @Column({
    type: DataType.ENUM(...Object.values(DosageUnit)),
    allowNull: false,
  })
  dosageUnit: DosageUnit;

  @Column({
    type: DataType.ENUM(...Object.values(Frequency)),
    allowNull: false,
  })
  frequency: Frequency;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  administrationInstructions: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  startDate: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  endDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  prescribedBy: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pharmacy: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  prescriptionNumber: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  refills: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  purpose: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  sideEffectsNotes: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  // Relationships
  @BelongsTo(() => Pet)
  pet: Pet;

  @BelongsTo(() => PetHealthRecord)
  healthRecord: PetHealthRecord;
}
