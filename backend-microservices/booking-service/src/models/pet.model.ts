import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  HasMany,
} from 'sequelize-typescript';
import { Booking } from './booking.model';

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  BIRD = 'bird',
  REPTILE = 'reptile',
  RODENT = 'rodent',
  OTHER = 'other',
}

export enum PetSize {
  XSMALL = 'xsmall',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge',
}

@Table({
  tableName: 'pets',
})
export class Pet extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Owner user ID',
  })
  ownerId: string;

  @Column({
    type: DataType.ENUM(...Object.values(PetType)),
    allowNull: false,
  })
  type: PetType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Specific breed of the pet',
  })
  breed: string;

  @Column({
    type: DataType.ENUM(...Object.values(PetSize)),
    allowNull: true,
  })
  size: PetSize;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date of birth or approximate age',
  })
  birthDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Gender of the pet (male, female, unknown)',
  })
  gender: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Special notes about the pet (allergies, behaviors, etc.)',
  })
  notes: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Image URL for the pet',
  })
  imageUrl: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Medical history or ongoing conditions',
  })
  medicalNotes: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isVaccinated: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Primary coat color',
  })
  color: string;

  @HasMany(() => Booking)
  bookings: Booking[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
