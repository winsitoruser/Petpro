import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { PetHotelRoom } from './pet-hotel-room.model';
import { Vendor } from '../vendor/vendor.model';
import { PetHotelBookingService } from './pet-hotel-booking-service.model';
import { PetHotelDailyReport } from './pet-hotel-daily-report.model';

export enum BookingStatus {
  BOOKED = 'booked',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Table({ 
  tableName: 'pet_hotel_bookings',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetHotelBooking extends Model<PetHotelBooking> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  petId: string;

  @ForeignKey(() => PetHotelRoom)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  roomId: string;

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vendorId: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  checkInDate: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  checkOutDate: Date;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  expectedCheckInTime: Date;

  @Column({
    type: DataType.TIME,
    allowNull: true,
  })
  expectedCheckOutTime: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  nightsCount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPrice: number;

  @Column({
    type: DataType.ENUM(...Object.values(BookingStatus)),
    allowNull: false,
    defaultValue: BookingStatus.BOOKED,
  })
  status: BookingStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  specialInstructions: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: {},
  })
  petItems: object;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  feedingSchedule: object[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  medicationSchedule: object[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  cancellationReason: string;

  // Relationships
  @BelongsTo(() => PetHotelRoom)
  room: PetHotelRoom;

  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @HasMany(() => PetHotelBookingService)
  services: PetHotelBookingService[];

  @HasMany(() => PetHotelDailyReport)
  dailyReports: PetHotelDailyReport[];
}
