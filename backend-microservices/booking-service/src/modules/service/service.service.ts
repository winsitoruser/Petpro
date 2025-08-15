import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Service, ServiceCategory } from '../../models/service.model';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { LoggerService } from '../../common/logger/logger.service';
import { EventsService } from '../../events/events.service';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service)
    private readonly serviceModel: typeof Service,
    private readonly logger: LoggerService,
    private readonly eventsService: EventsService,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const service = await this.serviceModel.create(createServiceDto);
      
      this.logger.log(`Service created: ${service.id}`, 'ServiceService');
      
      // Could publish an event that a new service was created
      // this.eventsService.publishServiceCreated({
      //   id: service.id,
      //   name: service.name,
      //   providerId: service.providerId,
      // });
      
      return service;
    } catch (error) {
      this.logger.error('Failed to create service', error, 'ServiceService');
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Service with this name already exists for this provider');
      }
      throw new BadRequestException('Failed to create service');
    }
  }

  async findAll(
    page = 1, 
    limit = 10,
    providerId?: string,
    category?: ServiceCategory,
    isActive?: boolean,
  ): Promise<{ services: Service[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {};
    if (providerId) {
      where.providerId = providerId;
    }
    if (category) {
      where.category = category;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    try {
      const { count, rows } = await this.serviceModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        services: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      this.logger.error('Failed to fetch services', error, 'ServiceService');
      throw new BadRequestException('Failed to fetch services');
    }
  }

  async findById(id: string): Promise<Service> {
    try {
      const service = await this.serviceModel.findByPk(id);
      
      if (!service) {
        throw new NotFoundException(`Service with ID ${id} not found`);
      }
      
      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch service with ID ${id}`, error, 'ServiceService');
      throw new BadRequestException('Failed to fetch service');
    }
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findById(id);

    try {
      await service.update(updateServiceDto);
      
      this.logger.log(`Service updated: ${id}`, 'ServiceService');
      
      // Could publish an event that a service was updated
      // this.eventsService.publishServiceUpdated({
      //   id: service.id,
      //   name: service.name,
      //   providerId: service.providerId,
      // });
      
      return service;
    } catch (error) {
      this.logger.error(`Failed to update service ${id}`, error, 'ServiceService');
      throw new BadRequestException('Failed to update service');
    }
  }

  async remove(id: string): Promise<boolean> {
    const service = await this.findById(id);

    try {
      // Soft delete
      await service.destroy();
      
      this.logger.log(`Service deleted: ${id}`, 'ServiceService');
      
      // Could publish an event that a service was deleted
      // this.eventsService.publishServiceDeleted({
      //   id: service.id,
      //   providerId: service.providerId,
      // });
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete service ${id}`, error, 'ServiceService');
      throw new BadRequestException('Failed to delete service');
    }
  }

  async search(query: string, page = 1, limit = 10): Promise<{ services: Service[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;

    try {
      const { count, rows } = await this.serviceModel.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } },
            { tags: { [Op.contains]: [query] } },
          ],
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      return {
        services: rows,
        total: count,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      this.logger.error('Failed to search services', error, 'ServiceService');
      throw new BadRequestException('Failed to search services');
    }
  }
}
