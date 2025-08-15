import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PetGroomingService } from '../../models/pet-grooming/pet-grooming-service.model';
import { PetGroomingServiceMapping } from '../../models/pet-grooming/pet-grooming-service-mapping.model';
import { PetGroomingServiceCategory } from '../../models/pet-grooming/pet-grooming-service-category.model';
import { CreatePetGroomingServiceDto } from './dto/create-pet-grooming-service.dto';
import { UpdatePetGroomingServiceDto } from './dto/update-pet-grooming-service.dto';

@Injectable()
export class PetGroomingServiceService {
  constructor(
    @InjectModel(PetGroomingService)
    private petGroomingServiceModel: typeof PetGroomingService,
    @InjectModel(PetGroomingServiceMapping)
    private petGroomingServiceMappingModel: typeof PetGroomingServiceMapping,
    @InjectModel(PetGroomingServiceCategory)
    private petGroomingServiceCategoryModel: typeof PetGroomingServiceCategory,
    private sequelize: Sequelize,
  ) {}

  /**
   * Create a new pet grooming service with category mappings
   */
  async create(vendorId: string, createPetGroomingServiceDto: CreatePetGroomingServiceDto): Promise<PetGroomingService> {
    const { categoryIds, ...serviceData } = createPetGroomingServiceDto;
    
    const result = await this.sequelize.transaction(async (transaction) => {
      // Create the service
      const service = await this.petGroomingServiceModel.create({
        ...serviceData,
        vendorId,
      }, { transaction });

      // If categories are provided, create the mappings
      if (categoryIds && categoryIds.length > 0) {
        // Verify all categories exist
        const categories = await this.petGroomingServiceCategoryModel.findAll({
          where: { id: categoryIds },
          transaction,
        });

        if (categories.length !== categoryIds.length) {
          throw new BadRequestException('One or more categories do not exist');
        }

        // Create category mappings
        const mappings = categoryIds.map(categoryId => ({
          serviceId: service.id,
          categoryId,
        }));

        await this.petGroomingServiceMappingModel.bulkCreate(mappings, { transaction });
      }

      return service;
    });

    // Fetch the complete service with relationships
    return this.findOne(result.id);
  }

  /**
   * Find all pet grooming services for a vendor
   */
  async findAllByVendorId(vendorId: string): Promise<PetGroomingService[]> {
    return this.petGroomingServiceModel.findAll({
      where: { vendorId },
      include: [
        {
          model: PetGroomingServiceMapping,
          include: [PetGroomingServiceCategory],
        },
      ],
      order: [['name', 'ASC']],
    });
  }

  /**
   * Find a pet grooming service by id
   */
  async findOne(id: string): Promise<PetGroomingService> {
    const service = await this.petGroomingServiceModel.findByPk(id, {
      include: [
        {
          model: PetGroomingServiceMapping,
          include: [PetGroomingServiceCategory],
        },
      ],
    });
    
    if (!service) {
      throw new NotFoundException(`Pet grooming service with ID ${id} not found`);
    }
    
    return service;
  }

  /**
   * Update a pet grooming service
   */
  async update(id: string, vendorId: string, updatePetGroomingServiceDto: UpdatePetGroomingServiceDto): Promise<PetGroomingService> {
    const { categoryIds, ...serviceData } = updatePetGroomingServiceDto;
    
    // Check if service exists and belongs to vendor
    const service = await this.petGroomingServiceModel.findOne({
      where: { id, vendorId },
    });
    
    if (!service) {
      throw new NotFoundException(`Pet grooming service with ID ${id} not found or does not belong to this vendor`);
    }
    
    const result = await this.sequelize.transaction(async (transaction) => {
      // Update service data
      await service.update(serviceData, { transaction });
      
      // Update category mappings if provided
      if (categoryIds !== undefined) {
        // Delete existing mappings
        await this.petGroomingServiceMappingModel.destroy({
          where: { serviceId: id },
          transaction,
        });
        
        // Create new mappings if categories are provided
        if (categoryIds && categoryIds.length > 0) {
          // Verify all categories exist
          const categories = await this.petGroomingServiceCategoryModel.findAll({
            where: { id: categoryIds },
            transaction,
          });
          
          if (categories.length !== categoryIds.length) {
            throw new BadRequestException('One or more categories do not exist');
          }
          
          // Create category mappings
          const mappings = categoryIds.map(categoryId => ({
            serviceId: service.id,
            categoryId,
          }));
          
          await this.petGroomingServiceMappingModel.bulkCreate(mappings, { transaction });
        }
      }
      
      return service;
    });
    
    // Fetch the complete updated service with relationships
    return this.findOne(result.id);
  }
  
  /**
   * Remove a pet grooming service
   */
  async remove(id: string, vendorId: string): Promise<void> {
    const service = await this.petGroomingServiceModel.findOne({
      where: { id, vendorId },
    });
    
    if (!service) {
      throw new NotFoundException(`Pet grooming service with ID ${id} not found or does not belong to this vendor`);
    }
    
    await this.sequelize.transaction(async (transaction) => {
      // Delete category mappings
      await this.petGroomingServiceMappingModel.destroy({
        where: { serviceId: id },
        transaction,
      });
      
      // Delete the service
      await service.destroy({ transaction });
    });
  }

  /**
   * Search for pet grooming services by criteria
   */
  async search(criteria: {
    petType?: string;
    sizeCategory?: string;
    active?: boolean;
    minPrice?: number;
    maxPrice?: number;
    categoryId?: string;
  }): Promise<PetGroomingService[]> {
    const { petType, sizeCategory, active, minPrice, maxPrice, categoryId } = criteria;
    
    const where: any = {};
    
    if (petType) {
      where.petType = petType;
    }
    
    if (sizeCategory) {
      where.sizeCategory = sizeCategory;
    }
    
    if (active !== undefined) {
      where.active = active;
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      
      if (minPrice !== undefined) {
        where.basePrice['$gte'] = minPrice;
      }
      
      if (maxPrice !== undefined) {
        where.basePrice['$lte'] = maxPrice;
      }
    }
    
    let include: any[] = [
      {
        model: PetGroomingServiceMapping,
        include: [PetGroomingServiceCategory],
      },
    ];
    
    if (categoryId) {
      include = [
        {
          model: PetGroomingServiceMapping,
          where: { categoryId },
          include: [PetGroomingServiceCategory],
        },
      ];
    }
    
    return this.petGroomingServiceModel.findAll({
      where,
      include,
      order: [['name', 'ASC']],
    });
  }
}
