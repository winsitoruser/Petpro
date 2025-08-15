import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Vendor, VendorStatus } from '../../models/vendor.model';
import { VendorService as VendorServiceModel } from '../../models/vendor-service.model';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreateVendorServiceDto } from './dto/create-vendor-service.dto';

@Injectable()
export class VendorService {
  constructor(
    @InjectModel(Vendor)
    private vendorModel: typeof Vendor,
    @InjectModel(VendorServiceModel)
    private vendorServiceModel: typeof VendorServiceModel,
    private sequelize: Sequelize,
  ) {}

  async findAll(options?: any): Promise<Vendor[]> {
    return this.vendorModel.findAll({
      where: options?.where || {},
      include: options?.include || [],
      order: options?.order || [['createdAt', 'DESC']],
      limit: options?.limit || undefined,
      offset: options?.offset || undefined,
    });
  }

  async findById(id: string): Promise<Vendor> {
    const vendor = await this.vendorModel.findByPk(id, {
      include: [VendorServiceModel],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async findByUserId(userId: string): Promise<Vendor> {
    const vendor = await this.vendorModel.findOne({
      where: { userId },
      include: [VendorServiceModel],
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with user ID ${userId} not found`);
    }

    return vendor;
  }

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Check if vendor already exists with the given userId
    const existingVendor = await this.vendorModel.findOne({
      where: { userId: createVendorDto.userId },
    });

    if (existingVendor) {
      throw new ConflictException(`Vendor with user ID ${createVendorDto.userId} already exists`);
    }

    // Start a transaction
    const transaction = await this.sequelize.transaction();

    try {
      // Create new vendor
      const vendor = await this.vendorModel.create(
        {
          ...createVendorDto,
          status: VendorStatus.PENDING,
        },
        { transaction },
      );

      await transaction.commit();
      return this.findById(vendor.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async update(id: string, updateData: Partial<Vendor>): Promise<Vendor> {
    const vendor = await this.findById(id);
    
    // Start a transaction
    const transaction = await this.sequelize.transaction();

    try {
      // Update vendor
      await vendor.update(updateData, { transaction });

      await transaction.commit();
      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateStatus(id: string, status: VendorStatus): Promise<Vendor> {
    const vendor = await this.findById(id);
    
    // If setting to active, set verification date
    const updateData: any = { status };
    
    if (status === VendorStatus.ACTIVE && vendor.status !== VendorStatus.ACTIVE) {
      updateData.verifiedAt = new Date();
    }
    
    // If deactivating, set deactivation date
    if (status === VendorStatus.INACTIVE && vendor.status !== VendorStatus.INACTIVE) {
      updateData.deactivatedAt = new Date();
    }

    return this.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    const vendor = await this.findById(id);
    
    // Start a transaction
    const transaction = await this.sequelize.transaction();

    try {
      // Delete all vendor services
      await this.vendorServiceModel.destroy({
        where: { vendorId: id },
        transaction,
      });

      // Delete vendor
      await vendor.destroy({ transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Vendor Service methods
  async findAllServices(vendorId: string): Promise<VendorServiceModel[]> {
    // Verify vendor exists
    await this.findById(vendorId);

    return this.vendorServiceModel.findAll({
      where: { vendorId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findServiceById(id: string): Promise<VendorServiceModel> {
    const service = await this.vendorServiceModel.findByPk(id, {
      include: [Vendor],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async createService(createServiceDto: CreateVendorServiceDto): Promise<VendorServiceModel> {
    // Verify vendor exists
    await this.findById(createServiceDto.vendorId);

    // Handle price factors and additional options conversion
    const serviceData = { ...createServiceDto };

    if (serviceData.priceFactors) {
      serviceData.priceFactors = serviceData.priceFactors.reduce((obj, factor) => {
        obj[factor.type] = factor.price;
        return obj;
      }, {});
    }

    // Create new service
    const service = await this.vendorServiceModel.create(serviceData);
    return this.findServiceById(service.id);
  }

  async updateService(id: string, updateData: Partial<VendorServiceModel>): Promise<VendorServiceModel> {
    const service = await this.findServiceById(id);
    
    // Handle price factors conversion if provided
    if (updateData.priceFactors && Array.isArray(updateData.priceFactors)) {
      updateData.priceFactors = updateData.priceFactors.reduce((obj, factor) => {
        obj[factor.type] = factor.price;
        return obj;
      }, {});
    }

    await service.update(updateData);
    return this.findServiceById(id);
  }

  async deleteService(id: string): Promise<void> {
    const service = await this.findServiceById(id);
    await service.destroy();
  }

  async searchVendors(query: string, location?: string, serviceType?: string, limit = 10, offset = 0): Promise<Vendor[]> {
    const whereClause = {};
    
    // Handle search query (business name, description)
    if (query) {
      whereClause['businessName'] = {
        [Sequelize.Op.iLike]: `%${query}%`,
      };
    }
    
    // Handle location (city, state, postalCode)
    if (location) {
      whereClause[Sequelize.Op.or] = [
        { city: { [Sequelize.Op.iLike]: `%${location}%` } },
        { state: { [Sequelize.Op.iLike]: `%${location}%` } },
        { postalCode: { [Sequelize.Op.iLike]: `%${location}%` } },
      ];
    }

    // Build include based on serviceType
    const include = [];
    if (serviceType) {
      include.push({
        model: VendorServiceModel,
        where: {
          type: serviceType,
        },
      });
    } else {
      include.push(VendorServiceModel);
    }

    return this.vendorModel.findAll({
      where: whereClause,
      include,
      order: [['averageRating', 'DESC']],
      limit,
      offset,
    });
  }
}
