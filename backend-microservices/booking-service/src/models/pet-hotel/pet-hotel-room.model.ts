import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Vendor } from '../vendor/vendor.model';
import { PetHotelBooking } from './pet-hotel-booking.model';
import { PetHotelAvailability } from './pet-hotel-availability.model';

export enum RoomType {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  PRIVATE = 'private',
}

export enum PetSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ALL = 'all',
}

export enum PetType {
  DOG = 'dog',
  CAT = 'cat',
  SMALL_ANIMAL = 'small_animal',
  ALL = 'all',
}

@Table({ 
  tableName: 'pet_hotel_rooms',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetHotelRoom extends Model<PetHotelRoom> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vendorId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  roomNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(RoomType)),
    allowNull: false,
  })
  roomType: RoomType;

  @Column({
    type: DataType.ENUM(...Object.values(PetSize)),
    allowNull: false,
    defaultValue: PetSize.ALL,
  })
  petSize: PetSize;

  @Column({
    type: DataType.ENUM(...Object.values(PetType)),
    allowNull: false,
  })
  petType: PetType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  capacity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  basePricePerNight: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  amenities: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  photos: string[];

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  // Relationships
  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @HasMany(() => PetHotelBooking)
  bookings: PetHotelBooking[];

  @HasMany(() => PetHotelAvailability)
  availabilities: PetHotelAvailability[];
}
