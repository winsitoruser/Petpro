import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  Default,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  FISH = 'fish',
  REPTILE = 'reptile',
  SMALL_MAMMAL = 'small_mammal',
  OTHER = 'other',
}

@Table({
  tableName: 'pets',
  underscored: true,
  timestamps: true,
})
export class Pet extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
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
    type: DataType.ENUM(...Object.values(PetType)),
    allowNull: false,
  })
  type: PetType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  breed: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  birthDate: Date;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  weight: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  color: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  photoUrl: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  medicalHistory: Record<string, any>;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  @BelongsTo(() => User)
  owner: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
