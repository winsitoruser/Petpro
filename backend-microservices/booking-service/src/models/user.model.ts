import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Review } from './review.model';
import { Booking } from './booking.model';
import { ReviewHelpful } from './review-helpful.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
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
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profileImage: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  businessName: string;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
  })
  averageRating: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  totalReviews: number;

  @Column({
    type: DataType.ENUM('customer', 'vendor', 'admin'),
    allowNull: false,
  })
  role: string;

  // Relationships
  @HasMany(() => Review, { foreignKey: 'customerId', as: 'customerReviews' })
  customerReviews: Review[];

  @HasMany(() => Review, { foreignKey: 'vendorId', as: 'vendorReviews' })
  vendorReviews: Review[];

  @HasMany(() => Booking, { foreignKey: 'customerId', as: 'customerBookings' })
  customerBookings: Booking[];

  @HasMany(() => Booking, { foreignKey: 'vendorId', as: 'vendorBookings' })
  vendorBookings: Booking[];

  @HasMany(() => ReviewHelpful)
  helpfulMarks: ReviewHelpful[];
}
