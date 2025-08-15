import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PetGroomingServiceCategory } from '../../models/pet-grooming/pet-grooming-service-category.model';

@Injectable()
export class PetGroomingCategoryService {
  constructor(
    @InjectModel(PetGroomingServiceCategory)
    private petGroomingServiceCategoryModel: typeof PetGroomingServiceCategory,
  ) {}

  /**
   * Create a new pet grooming service category
   */
  async create(data: {
    name: string;
    description?: string;
    icon?: string;
  }): Promise<PetGroomingServiceCategory> {
    return this.petGroomingServiceCategoryModel.create(data);
  }

  /**
   * Find all pet grooming service categories
   */
  async findAll(): Promise<PetGroomingServiceCategory[]> {
    return this.petGroomingServiceCategoryModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find a pet grooming service category by id
   */
  async findOne(id: string): Promise<PetGroomingServiceCategory> {
    const category = await this.petGroomingServiceCategoryModel.findByPk(id);
    
    if (!category) {
      throw new NotFoundException(`Pet grooming service category with ID ${id} not found`);
    }
    
    return category;
  }

  /**
   * Update a pet grooming service category
   */
  async update(id: string, data: {
    name?: string;
    description?: string;
    icon?: string;
  }): Promise<PetGroomingServiceCategory> {
    const category = await this.findOne(id);
    
    await category.update(data);
    return category;
  }

  /**
   * Remove a pet grooming service category
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    
    await category.destroy();
  }
}
