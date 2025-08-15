import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { PetGroomingService } from './pet-grooming-service.model';
import { PetGroomingServiceCategory } from './pet-grooming-service-category.model';

@Table({ 
  tableName: 'pet_grooming_service_mappings',
  timestamps: true,
  updatedAt: false,
})
export class PetGroomingServiceMapping extends Model<PetGroomingServiceMapping> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => PetGroomingService)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  serviceId: string;

  @ForeignKey(() => PetGroomingServiceCategory)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  categoryId: string;

  // Relationships
  @BelongsTo(() => PetGroomingService)
  service: PetGroomingService;

  @BelongsTo(() => PetGroomingServiceCategory)
  category: PetGroomingServiceCategory;
}
