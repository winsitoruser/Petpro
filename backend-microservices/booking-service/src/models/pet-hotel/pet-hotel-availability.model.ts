import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { PetHotelRoom } from './pet-hotel-room.model';

@Table({ 
  tableName: 'pet_hotel_availabilities',
  timestamps: true,
  paranoid: false
})
export class PetHotelAvailability extends Model<PetHotelAvailability> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => PetHotelRoom)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  roomId: string;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
  })
  date: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  isAvailable: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  availableCount: number;

  // Relationships
  @BelongsTo(() => PetHotelRoom)
  room: PetHotelRoom;
}
