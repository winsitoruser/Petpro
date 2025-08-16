import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  CreatedAt,
  UpdatedAt,
  Default,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGED = 'password_changed',
  EMAIL_VERIFIED = 'email_verified',
  BOOKING_CREATED = 'booking_created',
  BOOKING_UPDATED = 'booking_updated',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_MADE = 'payment_made',
  PAYMENT_REFUNDED = 'payment_refunded',
  PET_CREATED = 'pet_created',
  PET_UPDATED = 'pet_updated',
  PET_REMOVED = 'pet_removed',
  REVIEW_SUBMITTED = 'review_submitted',
  ADDRESS_ADDED = 'address_added',
  ADDRESS_UPDATED = 'address_updated',
  ADDRESS_REMOVED = 'address_removed',
  NOTIFICATION_SETTINGS_UPDATED = 'notification_settings_updated',
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_DEACTIVATED = 'account_deactivated',
  ACCOUNT_REACTIVATED = 'account_reactivated',
}

@Table({
  tableName: 'activities',
  underscored: true,
  timestamps: true,
})
export class Activity extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.ENUM(...Object.values(ActivityType)),
    allowNull: false,
  })
  type: ActivityType;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: Record<string, any>;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: 'ip_address',
  })
  ipAddress: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    field: 'user_agent',
  })
  userAgent: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  timestamp: Date;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
