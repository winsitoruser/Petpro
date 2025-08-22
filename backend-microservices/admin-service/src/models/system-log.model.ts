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
import { AdminUser } from './admin-user.model';

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug',
}

export enum LogCategory {
  AUTH = 'auth',
  USER_MANAGEMENT = 'user_management',
  SYSTEM = 'system',
  API = 'api',
  DATABASE = 'database',
}

@Table({
  tableName: 'system_logs',
  timestamps: true,
})
export class SystemLog extends Model<SystemLog> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => AdminUser)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId: string;

  @Column({
    type: DataType.ENUM(...Object.values(LogLevel)),
    allowNull: false,
  })
  level: LogLevel;

  @Column({
    type: DataType.ENUM(...Object.values(LogCategory)),
    allowNull: false,
  })
  category: LogCategory;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: any;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  ipAddress: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  userAgent: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => AdminUser)
  user: AdminUser;
}