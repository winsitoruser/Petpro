import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ 
  tableName: 'push_tokens',
  timestamps: true 
})
export class PushToken extends Model<PushToken> {
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  token: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  platform: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  deviceId: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  @BelongsTo(() => User)
  user: User;
}