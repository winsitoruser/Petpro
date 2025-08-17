import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import { UserSession } from './user-session.model';
import { SystemLog } from './system-log.model';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Table({
  tableName: 'admin_users',
  timestamps: true,
})
export class AdminUser extends Model<AdminUser> {
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
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

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
    type: DataType.ENUM(...Object.values(AdminRole)),
    allowNull: false,
    defaultValue: AdminRole.MODERATOR,
  })
  role: AdminRole;

  @Column({
    type: DataType.ENUM(...Object.values(AdminStatus)),
    allowNull: false,
    defaultValue: AdminStatus.ACTIVE,
  })
  status: AdminStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastLoginIp: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => UserSession)
  sessions: UserSession[];

  @HasMany(() => SystemLog)
  logs: SystemLog[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: AdminUser) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}