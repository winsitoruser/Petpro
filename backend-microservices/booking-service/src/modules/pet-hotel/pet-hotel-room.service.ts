import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PetHotelRoom } from '../../models/pet-hotel/pet-hotel-room.model';
import { CreatePetHotelRoomDto } from './dto/create-pet-hotel-room.dto';
import { UpdatePetHotelRoomDto } from './dto/update-pet-hotel-room.dto';
import { PetHotelAvailability } from '../../models/pet-hotel/pet-hotel-availability.model';

@Injectable()
export class PetHotelRoomService {
  constructor(
    @InjectModel(PetHotelRoom)
    private petHotelRoomModel: typeof PetHotelRoom,
    @InjectModel(PetHotelAvailability)
    private petHotelAvailabilityModel: typeof PetHotelAvailability,
    private sequelize: Sequelize,
  ) {}

  async create(vendorId: string, createPetHotelRoomDto: CreatePetHotelRoomDto): Promise<PetHotelRoom> {
    // Check if room number already exists for this vendor
    const existingRoom = await this.petHotelRoomModel.findOne({
      where: {
        vendorId,
        roomNumber: createPetHotelRoomDto.roomNumber,
      },
    });

    if (existingRoom) {
      throw new ConflictException(`Room number ${createPetHotelRoomDto.roomNumber} already exists for this vendor`);
    }

    return this.petHotelRoomModel.create({
      ...createPetHotelRoomDto,
      vendorId,
    });
  }

  async findAll(vendorId?: string): Promise<PetHotelRoom[]> {
    const where = vendorId ? { vendorId } : {};
    
    return this.petHotelRoomModel.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<PetHotelRoom> {
    const room = await this.petHotelRoomModel.findByPk(id);
    
    if (!room) {
      throw new NotFoundException(`Pet hotel room with ID ${id} not found`);
    }
    
    return room;
  }

  async findByVendorId(vendorId: string): Promise<PetHotelRoom[]> {
    return this.petHotelRoomModel.findAll({
      where: { vendorId },
      order: [['roomNumber', 'ASC']],
    });
  }

  async update(id: string, updatePetHotelRoomDto: UpdatePetHotelRoomDto): Promise<PetHotelRoom> {
    const room = await this.findOne(id);
    
    // If room number is being changed, check if the new number already exists
    if (updatePetHotelRoomDto.roomNumber && updatePetHotelRoomDto.roomNumber !== room.roomNumber) {
      const existingRoom = await this.petHotelRoomModel.findOne({
        where: {
          vendorId: room.vendorId,
          roomNumber: updatePetHotelRoomDto.roomNumber,
        },
      });

      if (existingRoom) {
        throw new ConflictException(`Room number ${updatePetHotelRoomDto.roomNumber} already exists for this vendor`);
      }
    }
    
    await room.update(updatePetHotelRoomDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const room = await this.findOne(id);
    await room.destroy();
  }

  async setAvailability(
    roomId: string, 
    dates: { date: Date; isAvailable: boolean; availableCount?: number }[]
  ): Promise<PetHotelAvailability[]> {
    // Verify room exists
    await this.findOne(roomId);

    const results = [];
    
    // Use transaction to ensure all availability updates are atomic
    const transaction = await this.sequelize.transaction();
    
    try {
      for (const dateInfo of dates) {
        const [availability, created] = await this.petHotelAvailabilityModel.findOrCreate({
          where: {
            roomId,
            date: dateInfo.date,
          },
          defaults: {
            isAvailable: dateInfo.isAvailable,
            availableCount: dateInfo.availableCount || 1,
          },
          transaction,
        });

        if (!created) {
          await availability.update({
            isAvailable: dateInfo.isAvailable,
            availableCount: dateInfo.availableCount !== undefined ? dateInfo.availableCount : availability.availableCount,
          }, { transaction });
        }

        results.push(availability);
      }
      
      await transaction.commit();
      return results;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getAvailability(roomId: string, startDate: Date, endDate: Date): Promise<PetHotelAvailability[]> {
    // Verify room exists
    await this.findOne(roomId);
    
    return this.petHotelAvailabilityModel.findAll({
      where: {
        roomId,
        date: {
          [Sequelize.Op.between]: [startDate, endDate],
        },
      },
      order: [['date', 'ASC']],
    });
  }

  async getAvailableRooms(
    startDate: Date, 
    endDate: Date, 
    vendorId?: string, 
    petType?: string, 
    petSize?: string
  ): Promise<PetHotelRoom[]> {
    const where: any = {};
    if (vendorId) {
      where.vendorId = vendorId;
    }
    
    if (petType) {
      where.petType = petType;
    }
    
    if (petSize) {
      where.petSize = petSize;
    }
    
    // Find rooms that match the criteria and are active
    where.active = true;
    
    const rooms = await this.petHotelRoomModel.findAll({ where });
    const result = [];
    
    // For each room, check if it's available for the entire requested period
    for (const room of rooms) {
      const availabilities = await this.petHotelAvailabilityModel.findAll({
        where: {
          roomId: room.id,
          date: {
            [Sequelize.Op.between]: [startDate, endDate],
          },
          isAvailable: false, // Look for dates where room is NOT available
        },
      });
      
      // If no unavailable dates are found, the room is available for the entire period
      if (availabilities.length === 0) {
        result.push(room);
      }
    }
    
    return result;
  }
}
