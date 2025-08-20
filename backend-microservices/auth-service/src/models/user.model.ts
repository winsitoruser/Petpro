import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, HasMany } from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import { RefreshToken } from './refresh-token.model';
import { Pet } from './pet.model';

@Table({ 
  tableName: 'users',
  timestamps: true,
  paranoid: true // Soft delete
})
export class User extends Model<User> {
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
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM('admin', 'vendor', 'customer'),
    allowNull: false,
    defaultValue: 'customer',
  })
  role: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isEmailVerified: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emailVerificationToken: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  emailVerificationTokenExpiry: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  passwordResetToken: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  passwordResetTokenExpiry: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLogin: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  externalId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phoneNumber: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  dateOfBirth: Date;

  @Column({
    type: DataType.ENUM('male', 'female', 'other'),
    allowNull: true,
  })
  gender: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  avatarUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profileImage: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  preferredLanguage: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metaData: any;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  addresses: any[];

  // Virtual property for fullName
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @HasMany(() => RefreshToken)
  refreshTokens: RefreshToken[];

  @HasMany(() => Pet)
  pets: Pet[];

  @BeforeCreate
  static async hashPasswordCreate(instance: User) {
    const salt = await bcrypt.genSalt(10);
    instance.password = await bcrypt.hash(instance.password, salt);
  }
  
  // For password updates, we'll handle the hashing in the service layer
  // before calling update on the model, rather than using BeforeUpdate hook
  // This avoids issues with Sequelize's changed/previous/getDataValue typing

  // Method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}
