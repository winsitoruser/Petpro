import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Vendor } from '../vendor/vendor.model';
import { PetHotelBookingService } from './pet-hotel-booking-service.model';

export enum PricingType {
  FLAT = 'flat',
  PER_NIGHT = 'per_night',
  PER_PET = 'per_pet',
}

@Table({ 
  tableName: 'pet_hotel_services',
  timestamps: true,
  paranoid: true // Soft delete
})
export class PetHotelService extends Model<PetHotelService> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vendorId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.ENUM(...Object.values(PricingType)),
    allowNull: false,
    defaultValue: PricingType.FLAT,
  })
  pricingType: PricingType;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  active: boolean;

  // Relationships
  @BelongsTo(() => Vendor)
  vendor: Vendor;

  @HasMany(() => PetHotelBookingService)
  bookingServices: PetHotelBookingService[];
}
