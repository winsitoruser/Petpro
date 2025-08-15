import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { PetGroomingServiceMapping } from './pet-grooming-service-mapping.model';

@Table({ 
  tableName: 'pet_grooming_service_categories',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetGroomingServiceCategory extends Model<PetGroomingServiceCategory> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  icon: string;

  // Relationships
  @HasMany(() => PetGroomingServiceMapping)
  serviceMappings: PetGroomingServiceMapping[];
}
