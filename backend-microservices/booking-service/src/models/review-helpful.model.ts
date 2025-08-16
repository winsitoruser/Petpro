import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Review } from './review.model';

@Table({
  tableName: 'review_helpful',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['reviewId', 'userId'],
    },
  ],
})
export class ReviewHelpful extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Review)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  reviewId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  // Relationships
  @BelongsTo(() => Review)
  review: Review;

  @BelongsTo(() => User)
  user: User;
}
