import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';
import { Service } from './service.model';
import { Pet } from './pet.model';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

@Table({
  tableName: 'bookings',
})
export class Booking extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    comment: 'Human-readable booking reference number',
  })
  bookingReference: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Customer user ID',
  })
  customerId: string;

  @ForeignKey(() => Service)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  serviceId: string;

  @BelongsTo(() => Service)
  service: Service;

  @ForeignKey(() => Pet)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  petId: string;

  @BelongsTo(() => Pet)
  pet: Pet;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endTime: Date;

  @Column({
    type: DataType.ENUM(...Object.values(BookingStatus)),
    allowNull: false,
    defaultValue: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatus)),
    allowNull: false,
    defaultValue: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPrice: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Customer special requests',
  })
  specialRequests: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Staff notes (not visible to customer)',
  })
  staffNotes: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'Staff member assigned to this booking',
  })
  assignedStaffId: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    comment: 'ID of related payment record',
  })
  paymentId: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  reminderSent: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'When the reminder was last sent',
  })
  reminderSentAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;

  @BeforeCreate
  @BeforeUpdate
  static async calculateEndTime(instance: Booking) {
    // If endTime is not set and we have service, calculate it based on service duration
    if (!instance.endTime && instance.startTime && instance.service) {
      const durationInMinutes = instance.service.duration;
      const startTime = new Date(instance.startTime);
      const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);
      instance.endTime = endTime;
    }
  }
  
  @BeforeCreate
  static async generateBookingReference(instance: Booking) {
    if (!instance.bookingReference) {
      // Generate a human-readable booking reference like PET-YYYY-MM-DD-XXXX
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
      instance.bookingReference = `PET-${year}${month}${day}-${random}`;
    }
  }
}
