import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ 
  tableName: 'pets',
  timestamps: true,
  paranoid: true // Soft delete
})
export class Pet extends Model<Pet> {
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
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  species: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  breed: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  birthDate: Date;

  @Column({
    type: DataType.ENUM('male', 'female', 'unknown'),
    allowNull: false,
    defaultValue: 'unknown',
  })
  gender: string;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  weight: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  color: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  photoUrl: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  specialNeeds: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  allergies: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  medicalConditions: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  dietaryRequirements: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  microchipped: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  microchipId: string;

  // Define relationship
  @BelongsTo(() => User)
  user: User;
}
