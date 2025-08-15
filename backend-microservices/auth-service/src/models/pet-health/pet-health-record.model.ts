import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Pet } from '../pet.model';
import { PetVaccination } from './pet-vaccination.model';
import { PetMedication } from './pet-medication.model';

@Table({ 
  tableName: 'pet_health_records',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetHealthRecord extends Model<PetHealthRecord> {
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
    type: DataType.DATEONLY,
    allowNull: false,
  })
  recordDate: Date;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  weight: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  weightUnit: string; // kg or lb

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  generalHealth: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  dietNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  behaviorNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  exerciseNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  symptomsNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  vetVisitNotes: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  nextCheckupDate: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  vitalSigns: object; // temperature, heart rate, etc.

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  allergies: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  conditions: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  photos: string[]; // URLs to health-related photos (e.g., skin conditions)

  @BelongsTo(() => Pet)
  pet: Pet;

  @HasMany(() => PetVaccination)
  vaccinations: PetVaccination[];

  @HasMany(() => PetMedication)
  medications: PetMedication[];
}
