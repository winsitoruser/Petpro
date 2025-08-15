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
} from 'sequelize-typescript';
import { Service } from './service.model';

export enum RecurrencePattern {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

@Table({
  tableName: 'service_availability',
})
export class ServiceAvailability extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Service)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  serviceId: string;

  @BelongsTo(() => Service)
  service: Service;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Start date and time of availability',
  })
  startTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'End date and time of availability',
  })
  endTime: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Maximum number of slots available at this time',
  })
  maxSlots: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of slots already booked',
  })
  bookedSlots: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isAvailable: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Notes regarding this availability slot',
  })
  notes: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    comment: 'Day of week (Monday, Tuesday, etc.) for recurring patterns',
  })
  dayOfWeek: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether this is a recurring availability pattern',
  })
  isRecurring: boolean;
  
  @Column({
    type: DataType.ENUM(...Object.values(RecurrencePattern)),
    allowNull: true,
    comment: 'Pattern of recurrence (daily, weekly, etc.)',
  })
  recurrencePattern: RecurrencePattern;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'End date for recurring availability',
  })
  recurrenceEndDate: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
