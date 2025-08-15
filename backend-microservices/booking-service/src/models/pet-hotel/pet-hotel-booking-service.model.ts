import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { PetHotelService } from './pet-hotel-service.model';
import { PetHotelBooking } from './pet-hotel-booking.model';

@Table({ 
  tableName: 'pet_hotel_booking_services',
  timestamps: true,
  updatedAt: false,
})
export class PetHotelBookingService extends Model<PetHotelBookingService> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => PetHotelBooking)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  bookingId: string;

  @ForeignKey(() => PetHotelService)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  serviceId: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  priceAtBooking: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  quantity: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  scheduledTime: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  // Relationships
  @BelongsTo(() => PetHotelBooking)
  booking: PetHotelBooking;

  @BelongsTo(() => PetHotelService)
  service: PetHotelService;
}
