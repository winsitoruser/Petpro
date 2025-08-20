import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({
  tableName: 'vendor_schedules',
})
export class VendorSchedule extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    comment: 'Vendor/Provider ID',
  })
  vendorId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Day of week (0 = Sunday, 1 = Monday, etc.)',
  })
  dayOfWeek: number;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  startTime: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  endTime: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isActive: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 30,
    comment: 'Default slot duration in minutes',
  })
  slotDuration: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}