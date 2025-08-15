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
import { ServiceAvailability } from './service-availability.model';

export enum ServiceCategory {
  GROOMING = 'grooming',
  VETERINARY = 'veterinary',
  BOARDING = 'boarding',
  DAYCARE = 'daycare',
  TRAINING = 'training',
}

@Table({
  tableName: 'services',
})
export class Service extends Model {
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
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 30,
    comment: 'Duration in minutes',
  })
  duration: number;

  @Column({
    type: DataType.ENUM(...Object.values(ServiceCategory)),
    allowNull: false,
  })
  category: ServiceCategory;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Vendor/Provider ID',
  })
  providerId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Image URL for the service',
  })
  imageUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
    defaultValue: [],
  })
  tags: string[];

  @HasMany(() => Booking)
  bookings: Booking[];

  @HasMany(() => ServiceAvailability)
  availability: ServiceAvailability[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
