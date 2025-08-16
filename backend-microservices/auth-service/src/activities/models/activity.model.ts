import { Column, Model, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { ActivityType } from '../enums/activity-type.enum';

@Table({
  tableName: 'activities',
})
export class Activity extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @BelongsTo(() => User)
  user: User;

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
  })
  ipAddress: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  userAgent: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  timestamp: Date;
}
