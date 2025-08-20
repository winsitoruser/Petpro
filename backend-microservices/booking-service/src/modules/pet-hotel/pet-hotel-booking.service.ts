import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize, Op } from 'sequelize';
import { PetHotelBooking, BookingStatus } from '../../models/pet-hotel/pet-hotel-booking.model';
import { PetHotelRoom } from '../../models/pet-hotel/pet-hotel-room.model';
import { PetHotelBookingService as PetHotelBookingServiceModel } from '../../models/pet-hotel/pet-hotel-booking-service.model';
import { PetHotelService } from '../../models/pet-hotel/pet-hotel-service.model';
import { PetHotelAvailability } from '../../models/pet-hotel/pet-hotel-availability.model';
import { CreatePetHotelBookingDto } from './dto/create-pet-hotel-booking.dto';
import { UpdatePetHotelBookingDto } from './dto/update-pet-hotel-booking.dto';
import { differenceInDays } from 'date-fns';

@Injectable()
export class PetHotelBookingService {
  constructor(
    @InjectModel(PetHotelBooking)
    private petHotelBookingModel: typeof PetHotelBooking,
    @InjectModel(PetHotelRoom)
    private petHotelRoomModel: typeof PetHotelRoom,
    @InjectModel(PetHotelBookingServiceModel)
    private petHotelBookingServiceModel: typeof PetHotelBookingServiceModel,
    @InjectModel(PetHotelService)
    private petHotelServiceModel: typeof PetHotelService,
    @InjectModel(PetHotelAvailability)
    private petHotelAvailabilityModel: typeof PetHotelAvailability,
    private sequelize: Sequelize,
  ) {}

  async create(createPetHotelBookingDto: CreatePetHotelBookingDto): Promise<PetHotelBooking> {
    // Find the room
    const room = await this.petHotelRoomModel.findByPk(createPetHotelBookingDto.roomId);
    if (!room) {
      throw new NotFoundException(`Pet hotel room with ID ${createPetHotelBookingDto.roomId} not found`);
    }

    const checkInDate = new Date(createPetHotelBookingDto.checkInDate);
    const checkOutDate = new Date(createPetHotelBookingDto.checkOutDate);
    
    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    // Calculate nights count
    const nightsCount = differenceInDays(checkOutDate, checkInDate);
    if (nightsCount < 1) {
      throw new BadRequestException('Booking must be for at least one night');
    }

    // Check room availability for the selected dates
    const dateRange = this.getDatesBetween(checkInDate, checkOutDate);
    
    // Use transaction for the entire booking process
    const transaction = await this.sequelize.transaction();

    try {
      // Check availability for each date
      for (const date of dateRange) {
        const availability = await this.petHotelAvailabilityModel.findOne({
          where: {
            roomId: room.id,
            date,
          },
          transaction,
        });

        // If explicitly marked as unavailable
        if (availability && !availability.isAvailable) {
          await transaction.rollback();
          throw new ConflictException(`Room is not available on ${date.toISOString().split('T')[0]}`);
        }

        // Check for existing bookings
        const existingBookingsCount = await this.petHotelBookingModel.count({
          where: {
            roomId: room.id,
            checkInDate: {
              [Op.lte]: date,
            },
            checkOutDate: {
              [Op.gt]: date,
            },
            status: {
              [Op.notIn]: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
            },
          },
          transaction,
        });

        // If room capacity is reached
        if (existingBookingsCount >= room.capacity) {
          await transaction.rollback();
          throw new ConflictException(`Room is fully booked on ${date.toISOString().split('T')[0]}`);
        }
      }

      // Calculate base price
      let totalPrice = room.basePricePerNight * nightsCount;
      
      // Create the booking
      const booking = await this.petHotelBookingModel.create({
        petId: createPetHotelBookingDto.petId,
        roomId: room.id,
        vendorId: room.vendorId,
        checkInDate,
        checkOutDate,
        expectedCheckInTime: createPetHotelBookingDto.expectedCheckInTime 
          ? new Date(`${createPetHotelBookingDto.checkInDate}T${createPetHotelBookingDto.expectedCheckInTime}:00`) 
          : null,
        expectedCheckOutTime: createPetHotelBookingDto.expectedCheckOutTime 
          ? new Date(`${createPetHotelBookingDto.checkOutDate}T${createPetHotelBookingDto.expectedCheckOutTime}:00`) 
          : null,
        nightsCount,
        totalPrice, // Will be updated with additional services
        specialInstructions: createPetHotelBookingDto.specialInstructions,
        petItems: createPetHotelBookingDto.petItems,
        feedingSchedule: createPetHotelBookingDto.feedingSchedule,
        medicationSchedule: createPetHotelBookingDto.medicationSchedule,
      }, { transaction });

      // Add services if provided
      if (createPetHotelBookingDto.services && createPetHotelBookingDto.services.length > 0) {
        let additionalServicesCost = 0;
        
        for (const serviceInfo of createPetHotelBookingDto.services) {
          // Find the service
          const service = await this.petHotelServiceModel.findByPk(serviceInfo.serviceId, { transaction });
          if (!service) {
            await transaction.rollback();
            throw new NotFoundException(`Pet hotel service with ID ${serviceInfo.serviceId} not found`);
          }

          // Calculate service cost
          const serviceCost = service.price * serviceInfo.quantity;
          additionalServicesCost += serviceCost;
          
          // Create booking service association
          await this.petHotelBookingServiceModel.create({
            bookingId: booking.id,
            serviceId: service.id,
            priceAtBooking: service.price,
            quantity: serviceInfo.quantity,
            scheduledTime: serviceInfo.scheduledTime ? new Date(serviceInfo.scheduledTime) : null,
            notes: serviceInfo.notes,
          }, { transaction });
        }
        
        // Update total price with service costs
        totalPrice += additionalServicesCost;
        await booking.update({ totalPrice }, { transaction });
      }
      
      await transaction.commit();
      return this.findOne(booking.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(
    vendorId?: string, 
    status?: string, 
    startDate?: Date, 
    endDate?: Date
  ): Promise<PetHotelBooking[]> {
    const where: any = {};
    
    if (vendorId) {
      where.vendorId = vendorId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (startDate && endDate) {
      where[Op.or] = [
        {
          checkInDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        {
          checkOutDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        {
          [Op.and]: [
            {
              checkInDate: {
                [Op.lte]: startDate,
              },
            },
            {
              checkOutDate: {
                [Op.gte]: endDate,
              },
            },
          ],
        },
      ];
    }
    
    return this.petHotelBookingModel.findAll({
      where,
      include: [
        { model: PetHotelRoom },
        { model: PetHotelBookingServiceModel, include: [PetHotelService] },
      ],
      order: [['checkInDate', 'ASC']],
    });
  }

  async findOne(id: string): Promise<PetHotelBooking> {
    const booking = await this.petHotelBookingModel.findByPk(id, {
      include: [
        { model: PetHotelRoom },
        { model: PetHotelBookingServiceModel, include: [PetHotelService] },
      ],
    });
    
    if (!booking) {
      throw new NotFoundException(`Pet hotel booking with ID ${id} not found`);
    }
    
    return booking;
  }

  async update(id: string, updatePetHotelBookingDto: UpdatePetHotelBookingDto): Promise<PetHotelBooking> {
    const booking = await this.findOne(id);
    
    // Don't allow updating cancelled or no-show bookings
    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.NO_SHOW) {
      throw new BadRequestException(`Cannot update ${booking.status} booking`);
    }
    
    // Check if trying to cancel
    if (updatePetHotelBookingDto.status === BookingStatus.CANCELLED && 
        !updatePetHotelBookingDto.cancellationReason) {
      throw new BadRequestException('Cancellation reason is required when cancelling a booking');
    }

    const transaction = await this.sequelize.transaction();
    
    try {
      // If room is changing, check availability
      if (updatePetHotelBookingDto.roomId && updatePetHotelBookingDto.roomId !== booking.roomId) {
        const room = await this.petHotelRoomModel.findByPk(updatePetHotelBookingDto.roomId, { transaction });
        if (!room) {
          throw new NotFoundException(`Pet hotel room with ID ${updatePetHotelBookingDto.roomId} not found`);
        }

        // Check availability for the new room
        const checkInDate = updatePetHotelBookingDto.checkInDate 
          ? new Date(updatePetHotelBookingDto.checkInDate)
          : booking.checkInDate;
          
        const checkOutDate = updatePetHotelBookingDto.checkOutDate
          ? new Date(updatePetHotelBookingDto.checkOutDate)
          : booking.checkOutDate;

        const dateRange = this.getDatesBetween(checkInDate, checkOutDate);
        
        for (const date of dateRange) {
          const availability = await this.petHotelAvailabilityModel.findOne({
            where: {
              roomId: room.id,
              date,
            },
            transaction,
          });

          if (availability && !availability.isAvailable) {
            await transaction.rollback();
            throw new ConflictException(`New room is not available on ${date.toISOString().split('T')[0]}`);
          }

          // Check for existing bookings
          const existingBookingsCount = await this.petHotelBookingModel.count({
            where: {
              id: { [Op.ne]: booking.id }, // Exclude current booking
              roomId: room.id,
              checkInDate: {
                [Op.lte]: date,
              },
              checkOutDate: {
                [Op.gt]: date,
              },
              status: {
                [Op.notIn]: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
              },
            },
            transaction,
          });

          if (existingBookingsCount >= room.capacity) {
            await transaction.rollback();
            throw new ConflictException(`New room is fully booked on ${date.toISOString().split('T')[0]}`);
          }
        }
      }

      // If dates are changing, recalculate nights count
      if (updatePetHotelBookingDto.checkInDate || updatePetHotelBookingDto.checkOutDate) {
        const checkInDate = updatePetHotelBookingDto.checkInDate 
          ? new Date(updatePetHotelBookingDto.checkInDate)
          : booking.checkInDate;
          
        const checkOutDate = updatePetHotelBookingDto.checkOutDate
          ? new Date(updatePetHotelBookingDto.checkOutDate)
          : booking.checkOutDate;

        if (checkInDate >= checkOutDate) {
          await transaction.rollback();
          throw new BadRequestException('Check-out date must be after check-in date');
        }

        const nightsCount = differenceInDays(checkOutDate, checkInDate);
        if (nightsCount < 1) {
          await transaction.rollback();
          throw new BadRequestException('Booking must be for at least one night');
        }

        // Recalculate total price based on new nights count
        const room = await this.petHotelRoomModel.findByPk(
          updatePetHotelBookingDto.roomId || booking.roomId, 
          { transaction }
        );
        
        const basePrice = room.basePricePerNight * nightsCount;
        
        // Get additional service costs
        const bookingServices = await this.petHotelBookingServiceModel.findAll({
          where: { bookingId: booking.id },
          include: [PetHotelService],
          transaction,
        });
        
        const servicesCost = bookingServices.reduce((total, bs) => {
          return total + (bs.priceAtBooking * bs.quantity);
        }, 0);
        
        // Update the booking with new calculated values
        const updateData: any = { ...updatePetHotelBookingDto };
        // Convert date strings to Date objects
        if (updateData.checkInDate) {
          updateData.checkInDate = new Date(updateData.checkInDate);
        }
        if (updateData.checkOutDate) {
          updateData.checkOutDate = new Date(updateData.checkOutDate);
        }
        if (updateData.expectedCheckInTime) {
          updateData.expectedCheckInTime = new Date(`${updateData.checkInDate}T${updateData.expectedCheckInTime}:00`);
        }
        if (updateData.expectedCheckOutTime) {
          updateData.expectedCheckOutTime = new Date(`${updateData.checkOutDate}T${updateData.expectedCheckOutTime}:00`);
        }
        
        await booking.update({
          ...updateData,
          nightsCount,
          totalPrice: basePrice + servicesCost,
        }, { transaction });
      } else {
        // Update with provided data without recalculating
        const updateData: any = { ...updatePetHotelBookingDto };
        // Convert date strings to Date objects
        if (updateData.checkInDate) {
          updateData.checkInDate = new Date(updateData.checkInDate);
        }
        if (updateData.checkOutDate) {
          updateData.checkOutDate = new Date(updateData.checkOutDate);
        }
        if (updateData.expectedCheckInTime) {
          updateData.expectedCheckInTime = new Date(`${updatePetHotelBookingDto.checkInDate}T${updateData.expectedCheckInTime}:00`);
        }
        if (updateData.expectedCheckOutTime) {
          updateData.expectedCheckOutTime = new Date(`${updatePetHotelBookingDto.checkOutDate}T${updateData.expectedCheckOutTime}:00`);
        }
        await booking.update(updateData, { transaction });
      }

      await transaction.commit();
      return this.findOne(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateStatus(
    id: string, 
    status: BookingStatus, 
    cancellationReason?: string
  ): Promise<PetHotelBooking> {
    const booking = await this.findOne(id);
    
    // Validate status transitions
    switch (status) {
      case BookingStatus.CHECKED_IN:
        if (booking.status !== BookingStatus.BOOKED) {
          throw new BadRequestException('Can only check in a booked reservation');
        }
        break;
      case BookingStatus.CHECKED_OUT:
        if (booking.status !== BookingStatus.CHECKED_IN) {
          throw new BadRequestException('Can only check out a checked-in reservation');
        }
        break;
      case BookingStatus.CANCELLED:
        if (![BookingStatus.BOOKED, BookingStatus.CHECKED_IN].includes(booking.status)) {
          throw new BadRequestException('Can only cancel a booked or checked-in reservation');
        }
        if (!cancellationReason) {
          throw new BadRequestException('Cancellation reason is required');
        }
        break;
      case BookingStatus.NO_SHOW:
        if (booking.status !== BookingStatus.BOOKED) {
          throw new BadRequestException('Can only mark a booked reservation as no-show');
        }
        break;
      default:
        throw new BadRequestException(`Invalid status: ${status}`);
    }
    
    await booking.update({ 
      status,
      cancellationReason: status === BookingStatus.CANCELLED ? cancellationReason : booking.cancellationReason
    });
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);
    
    if (booking.status === BookingStatus.CHECKED_IN) {
      throw new BadRequestException('Cannot delete a checked-in reservation');
    }
    
    // Use soft delete (paranoid)
    await booking.destroy();
  }

  private getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    // Convert to date only (no time)
    currentDate.setHours(0, 0, 0, 0);
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(0, 0, 0, 0);
    
    // Create a date for each day until (but not including) the checkout date
    while (currentDate < endDateOnly) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
}
