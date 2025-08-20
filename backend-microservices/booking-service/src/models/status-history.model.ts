import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Booking, BookingStatus } from './booking.model';

@Table({
  tableName: 'booking_status_history',
})
export class StatusHistory extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Booking)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  bookingId: string;

  @BelongsTo(() => Booking)
  booking: Booking;

  @Column({
    type: DataType.ENUM(...Object.values(BookingStatus)),
    allowNull: false,
  })
  status: BookingStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'Staff member who changed the status',
  })
  changedBy: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}