import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Pet } from '../../models/pet.model';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { LoggerService } from '../../common/logger/logger.service';
import { EventsService } from '../../events/events.service';

@Injectable()
export class PetService {
  constructor(
    @InjectModel(Pet)
    private readonly petModel: typeof Pet,
    private readonly logger: LoggerService,
    private readonly eventsService: EventsService,
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    try {
      const pet = await this.petModel.create({
        ...createPetDto,
        birthDate: createPetDto.birthDate ? new Date(createPetDto.birthDate) : null,
      });
      
      this.logger.log(`Pet created: ${pet.id}`, 'PetService');
      
      // Could publish an event that a new pet was registered
      // this.eventsService.publishPetRegistered({
      //   id: pet.id,
      //   name: pet.name,
      //   ownerId: pet.ownerId,
      // });
      
      return pet;
    } catch (error) {
      this.logger.error('Failed to create pet', error, 'PetService');
      throw new BadRequestException('Failed to create pet');
    }
  }

  async findAll(
    page = 1, 
    limit = 10,
    ownerId?: string,
  ): Promise<{ pets: Pet[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {};
    if (ownerId) {
      where.ownerId = ownerId;
    }

    try {
      const { count, rows } = await this.petModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        pets: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      this.logger.error('Failed to fetch pets', error, 'PetService');
      throw new BadRequestException('Failed to fetch pets');
    }
  }

  async findById(id: string): Promise<Pet> {
    try {
      const pet = await this.petModel.findByPk(id);
      
      if (!pet) {
        throw new NotFoundException(`Pet with ID ${id} not found`);
      }
      
      return pet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch pet with ID ${id}`, error, 'PetService');
      throw new BadRequestException('Failed to fetch pet');
    }
  }

  async update(id: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findById(id);

    try {
      await pet.update({
        ...updatePetDto,
        ...(updatePetDto.birthDate && { birthDate: new Date(updatePetDto.birthDate) }),
      });
      
      this.logger.log(`Pet updated: ${id}`, 'PetService');
      
      return pet;
    } catch (error) {
      this.logger.error(`Failed to update pet ${id}`, error, 'PetService');
      throw new BadRequestException('Failed to update pet');
    }
  }

  async remove(id: string): Promise<boolean> {
    const pet = await this.findById(id);

    try {
      // Check if pet has any active bookings before deletion
      // In a real implementation, you would check if this pet is referenced in any bookings
      
      // Soft delete
      await pet.destroy();
      
      this.logger.log(`Pet deleted: ${id}`, 'PetService');
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete pet ${id}`, error, 'PetService');
      throw new BadRequestException('Failed to delete pet');
    }
  }

  async findByOwner(ownerId: string): Promise<Pet[]> {
    try {
      return await this.petModel.findAll({
        where: { ownerId },
        order: [['name', 'ASC']],
      });
    } catch (error) {
      this.logger.error(`Failed to fetch pets for owner ${ownerId}`, error, 'PetService');
      throw new BadRequestException(`Failed to fetch pets for owner ${ownerId}`);
    }
  }

  async search(query: string, page = 1, limit = 10): Promise<{ pets: Pet[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;

    try {
      const { count, rows } = await this.petModel.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { breed: { [Op.iLike]: `%${query}%` } },
          ],
        },
        limit,
        offset,
        order: [['name', 'ASC']],
      });

      return {
        pets: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      this.logger.error('Failed to search pets', error, 'PetService');
      throw new BadRequestException('Failed to search pets');
    }
  }
}
