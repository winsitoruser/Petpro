import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pet } from '../../models/pet.model';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Injectable()
export class PetService {
  constructor(
    @InjectModel(Pet)
    private petModel: typeof Pet,
  ) {}

  /**
   * Create a new pet record for a user
   */
  async create(userId: string, createPetDto: CreatePetDto): Promise<Pet> {
    const petData: any = {
      ...createPetDto,
      userId,
    };

    // Convert birthDate string to Date if provided
    if (createPetDto.birthDate) {
      petData.birthDate = new Date(createPetDto.birthDate);
    }

    const pet = await this.petModel.create(petData);

    return pet;
  }

  /**
   * Find all pets for a user
   */
  async findAllByUserId(userId: string): Promise<Pet[]> {
    return this.petModel.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Find a pet by id
   */
  async findOne(id: string): Promise<Pet> {
    const pet = await this.petModel.findByPk(id);
    
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${id} not found`);
    }
    
    return pet;
  }

  /**
   * Verify pet belongs to user
   */
  async verifyPetOwnership(petId: string, userId: string): Promise<Pet> {
    const pet = await this.petModel.findByPk(petId);
    
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    if (pet.userId !== userId) {
      throw new UnauthorizedException('You are not authorized to access this pet');
    }
    
    return pet;
  }

  /**
   * Update a pet
   */
  async update(id: string, userId: string, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.verifyPetOwnership(id, userId);
    
    const updateData: any = { ...updatePetDto };
    
    // Convert birthDate string to Date if provided
    if (updatePetDto.birthDate) {
      updateData.birthDate = new Date(updatePetDto.birthDate as string);
    }
    
    await pet.update(updateData);
    return pet;
  }

  /**
   * Remove a pet
   */
  async remove(id: string, userId: string): Promise<void> {
    const pet = await this.verifyPetOwnership(id, userId);
    
    await pet.destroy();
  }
}
