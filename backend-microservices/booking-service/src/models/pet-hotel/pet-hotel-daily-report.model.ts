import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { PetHotelBooking } from './pet-hotel-booking.model';

export enum PetMood {
  HAPPY = 'happy',
  CALM = 'calm',
  ANXIOUS = 'anxious',
  PLAYFUL = 'playful',
  TIRED = 'tired',
  STRESSED = 'stressed',
}

@Table({ 
  tableName: 'pet_hotel_daily_reports',
  timestamps: true,
  paranoid: true
})
export class PetHotelDailyReport extends Model<PetHotelDailyReport> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => PetHotelBooking)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  bookingId: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  date: Date;

  @Column({
    type: DataType.ENUM(...Object.values(PetMood)),
    allowNull: false,
  })
  mood: PetMood;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  hasEaten: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  foodNotes: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  medicationGiven: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  medicationNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  activities: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  healthNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  behaviorNotes: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  additionalNotes: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    defaultValue: [],
  })
  photos: string[];

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  staffId: string;

  // Relationships
  @BelongsTo(() => PetHotelBooking)
  booking: PetHotelBooking;
}
