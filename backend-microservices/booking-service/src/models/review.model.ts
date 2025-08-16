import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './user.model';
import { Booking } from './booking.model';
import { Service } from './service.model';
import { ReviewHelpful } from './review-helpful.model';

@Table({
  tableName: 'reviews',
  timestamps: true,
  paranoid: true,
})
export class Review extends Model {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  customerId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vendorId: string;

  @ForeignKey(() => Service)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  serviceId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  })
  rating: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  review: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  anonymous: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  helpfulCount: number;

  @Column({
    type: DataType.ENUM('pending', 'published', 'hidden'),
    defaultValue: 'published',
  })
  status: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  publishedAt: Date;

  // Relationships
  @BelongsTo(() => Booking)
  booking: Booking;

  @BelongsTo(() => User, { as: 'customer' })
  customer: User;

  @BelongsTo(() => User, { as: 'vendor' })
  vendor: User;

  @BelongsTo(() => Service)
  service: Service;

  @HasMany(() => ReviewHelpful)
  helpfulMarks: ReviewHelpful[];
}
