import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Pet } from '../pet.model';
import { PetHealthRecord } from './pet-health-record.model';

@Table({ 
  tableName: 'pet_vaccinations',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetVaccination extends Model<PetVaccination> {
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
  vaccineName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  manufacturer: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lotNumber: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  dateAdministered: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  expirationDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  administeredBy: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  administeredAt: string; // Location/clinic name

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isRequired: boolean;

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
