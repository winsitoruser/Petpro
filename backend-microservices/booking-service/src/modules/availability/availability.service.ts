import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ServiceAvailability } from '../../models/service-availability.model';
import { Service } from '../../models/service.model';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { LoggerService } from '../../common/logger/logger.service';
import { EventsService } from '../../events/events.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(ServiceAvailability)
    private readonly availabilityModel: typeof ServiceAvailability,
    @InjectModel(Service)
    private readonly serviceModel: typeof Service,
    private readonly logger: LoggerService,
    private readonly eventsService: EventsService,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilityDto): Promise<ServiceAvailability> {
    // Validate that service exists
    const service = await this.serviceModel.findByPk(createAvailabilityDto.serviceId);
    if (!service) {
      throw new NotFoundException(`Service with ID ${createAvailabilityDto.serviceId} not found`);
    }

    // Parse dates
    const startTime = new Date(createAvailabilityDto.startTime);
    const endTime = new Date(createAvailabilityDto.endTime);
    
    // Validate date range
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check for overlapping availability slots for the same service
    const overlappingSlot = await this.availabilityModel.findOne({
      where: {
        serviceId: createAvailabilityDto.serviceId,
        [Op.or]: [
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime },
          },
        ],
      },
    });

    if (overlappingSlot) {
      throw new ConflictException('Availability slot overlaps with an existing slot');
    }

    try {
      const recurrenceEndDate = createAvailabilityDto.recurrenceEndDate ? 
        new Date(createAvailabilityDto.recurrenceEndDate) : null;
        
      const availability = await this.availabilityModel.create({
        ...createAvailabilityDto,
        startTime,
        endTime,
        recurrenceEndDate,
      });
      
      this.logger.log(`Availability created: ${availability.id}`, 'AvailabilityService');
      
      // Could publish an event that a new availability slot was created
      // this.eventsService.publishAvailabilityCreated({
      //   id: availability.id,
      //   serviceId: availability.serviceId,
      //   startTime: availability.startTime,
      //   endTime: availability.endTime,
      // });
      
      return availability;
    } catch (error) {
      this.logger.error('Failed to create availability', error, 'AvailabilityService');
      throw new BadRequestException('Failed to create availability');
    }
  }

  async findAll(
    page = 1, 
    limit = 10,
    serviceId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ availabilities: ServiceAvailability[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {};
    
    if (serviceId) {
      where.serviceId = serviceId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      where[Op.or] = [];
      
      // Non-recurring slots that overlap with the date range
      const dateRangeFilter: any = {};
      
      if (startDate) {
        dateRangeFilter.endTime = { [Op.gte]: startDate };
      }
      
      if (endDate) {
        dateRangeFilter.startTime = { [Op.lte]: endDate };
      }
      
      where[Op.or].push(dateRangeFilter);
      
      // Recurring slots that may apply to the date range
      if (startDate) {
        where[Op.or].push({
          isRecurring: true,
          recurrenceEndDate: { [Op.gte]: startDate },
        });
      }
    }

    try {
      const { count, rows } = await this.availabilityModel.findAndCountAll({
        where,
        include: [Service],
        limit,
        offset,
        order: [['startTime', 'ASC']],
      });

      return {
        availabilities: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      this.logger.error('Failed to fetch availabilities', error, 'AvailabilityService');
      throw new BadRequestException('Failed to fetch availabilities');
    }
  }

  async findById(id: string): Promise<ServiceAvailability> {
    try {
      const availability = await this.availabilityModel.findByPk(id, {
        include: [Service],
      });
      
      if (!availability) {
        throw new NotFoundException(`Availability with ID ${id} not found`);
      }
      
      return availability;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch availability with ID ${id}`, error, 'AvailabilityService');
      throw new BadRequestException('Failed to fetch availability');
    }
  }

  async findByService(serviceId: string): Promise<ServiceAvailability[]> {
    try {
      // Verify service exists
      const service = await this.serviceModel.findByPk(serviceId);
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }
      
      return await this.availabilityModel.findAll({
        where: { serviceId },
        order: [['startTime', 'ASC']],
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch availabilities for service ${serviceId}`, error, 'AvailabilityService');
      throw new BadRequestException(`Failed to fetch availabilities for service ${serviceId}`);
    }
  }

  async update(id: string, updateAvailabilityDto: UpdateAvailabilityDto): Promise<ServiceAvailability> {
    const availability = await this.findById(id);

    // If updating time range, check for conflicts
    if (updateAvailabilityDto.startTime || updateAvailabilityDto.endTime) {
      const startTime = updateAvailabilityDto.startTime ? 
        new Date(updateAvailabilityDto.startTime) : availability.startTime;
      
      const endTime = updateAvailabilityDto.endTime ? 
        new Date(updateAvailabilityDto.endTime) : availability.endTime;
      
      // Validate date range
      if (startTime >= endTime) {
        throw new BadRequestException('Start time must be before end time');
      }
      
      // Check for overlapping availability slots for the same service
      const overlappingSlot = await this.availabilityModel.findOne({
        where: {
          serviceId: availability.serviceId,
          id: { [Op.ne]: id }, // Exclude current availability
          [Op.or]: [
            {
              startTime: { [Op.lt]: endTime },
              endTime: { [Op.gt]: startTime },
            },
          ],
        },
      });

      if (overlappingSlot) {
        throw new ConflictException('Updated availability slot overlaps with an existing slot');
      }
    }

    try {
      const updates: any = { ...updateAvailabilityDto };
      
      // Convert date strings to Date objects
      if (updateAvailabilityDto.startTime) {
        updates.startTime = new Date(updateAvailabilityDto.startTime);
      }
      
      if (updateAvailabilityDto.endTime) {
        updates.endTime = new Date(updateAvailabilityDto.endTime);
      }
      
      if (updateAvailabilityDto.recurrenceEndDate) {
        updates.recurrenceEndDate = new Date(updateAvailabilityDto.recurrenceEndDate);
      }
      
      await availability.update(updates);
      
      this.logger.log(`Availability updated: ${id}`, 'AvailabilityService');
      
      return this.findById(id);
    } catch (error) {
      this.logger.error(`Failed to update availability ${id}`, error, 'AvailabilityService');
      throw new BadRequestException('Failed to update availability');
    }
  }

  async remove(id: string): Promise<boolean> {
    const availability = await this.findById(id);

    try {
      // Soft delete
      await availability.destroy();
      
      this.logger.log(`Availability deleted: ${id}`, 'AvailabilityService');
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete availability ${id}`, error, 'AvailabilityService');
      throw new BadRequestException('Failed to delete availability');
    }
  }

  async getAvailableSlots(
    serviceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ date: string; slots: { start: string; end: string; available: number }[] }[]> {
    try {
      // Verify service exists
      const service = await this.serviceModel.findByPk(serviceId);
      if (!service) {
        throw new NotFoundException(`Service with ID ${serviceId} not found`);
      }

      // Get all availability slots for the service
      const availabilities = await this.availabilityModel.findAll({
        where: {
          serviceId,
          [Op.or]: [
            // Non-recurring slots within date range
            {
              startTime: { [Op.lt]: endDate },
              endTime: { [Op.gt]: startDate },
              isRecurring: false,
            },
            // Recurring slots that may apply
            {
              isRecurring: true,
              [Op.or]: [
                { recurrenceEndDate: { [Op.gte]: startDate } },
                { recurrenceEndDate: null },
              ],
            },
          ],
        },
      });

      // Get bookings for this service in the date range to calculate actual availability
      // In a real implementation, you'd get existing bookings and subtract them
      // from the available slots
      
      // Process the availabilities to generate available time slots by day
      // This is a simplified version - in a real implementation you would handle
      // recurring patterns properly and account for existing bookings
      const result = [];
      
      // Clone the start date so we don't modify the original
      const currentDate = new Date(startDate);
      
      // Loop through each day in the range
      while (currentDate <= endDate) {
        const daySlots = [];
        const dayString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Check each availability slot
        for (const slot of availabilities) {
          // If it's not recurring and not on this day, skip
          if (!slot.isRecurring) {
            const slotDate = new Date(slot.startTime);
            if (slotDate.toISOString().split('T')[0] !== dayString) {
              continue;
            }
          } else {
            // For recurring slots, check if the pattern applies to this day
            // This is a simplified check - a real implementation would be more complex
            const slotDay = new Date(slot.startTime).getDay();
            const currentDay = currentDate.getDay();
            
            if (
              (slot.recurrencePattern === 'DAILY') ||
              (slot.recurrencePattern === 'WEEKLY' && slotDay === currentDay) ||
              (slot.recurrencePattern === 'MONTHLY' && new Date(slot.startTime).getDate() === currentDate.getDate())
            ) {
              // The recurrence pattern matches this day
            } else {
              continue;
            }
          }
          
          // Calculate available slots (maxSlots - bookedSlots)
          const availableSlots = slot.maxSlots - slot.bookedSlots;
          
          if (availableSlots > 0) {
            daySlots.push({
              start: new Date(slot.startTime).toISOString(),
              end: new Date(slot.endTime).toISOString(),
              available: availableSlots,
            });
          }
        }
        
        // Add this day's slots to the result
        if (daySlots.length > 0) {
          result.push({
            date: dayString,
            slots: daySlots,
          });
        }
        
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to get available slots for service ${serviceId}`, error, 'AvailabilityService');
      throw new BadRequestException(`Failed to get available slots for service ${serviceId}`);
    }
  }

  async incrementBookedSlots(id: string, count = 1): Promise<ServiceAvailability> {
    const availability = await this.findById(id);
    
    if (availability.bookedSlots + count > availability.maxSlots) {
      throw new ConflictException('Not enough slots available');
    }
    
    try {
      await availability.update({
        bookedSlots: availability.bookedSlots + count,
      });
      
      this.logger.log(`Incremented booked slots for availability ${id}`, 'AvailabilityService');
      
      return availability;
    } catch (error) {
      this.logger.error(`Failed to increment booked slots for availability ${id}`, error, 'AvailabilityService');
      throw new BadRequestException('Failed to update availability');
    }
  }

  async decrementBookedSlots(id: string, count = 1): Promise<ServiceAvailability> {
    const availability = await this.findById(id);
    
    try {
      await availability.update({
        bookedSlots: Math.max(0, availability.bookedSlots - count),
      });
      
      this.logger.log(`Decremented booked slots for availability ${id}`, 'AvailabilityService');
      
      return availability;
    } catch (error) {
      this.logger.error(`Failed to decrement booked slots for availability ${id}`, error, 'AvailabilityService');
      throw new BadRequestException('Failed to update availability');
    }
  }
}
