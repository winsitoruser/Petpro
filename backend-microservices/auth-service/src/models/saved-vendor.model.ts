import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ 
  tableName: 'saved_vendors',
  timestamps: true 
})
export class SavedVendor extends Model<SavedVendor> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  customerId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vendorId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  notes: string;

  @BelongsTo(() => User)
  customer: User;

  @BelongsTo(() => User, { foreignKey: 'vendorId', as: 'vendor' })
  vendor: User;
}