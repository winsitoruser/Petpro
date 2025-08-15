import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreateVendorServiceDto } from './dto/create-vendor-service.dto';
import { Vendor, VendorStatus } from '../../models/vendor.model';
import { VendorService as VendorServiceModel } from '../../models/vendor-service.model';

@Controller()
export class VendorMicroserviceController {
  constructor(private readonly vendorService: VendorService) {}

  @MessagePattern('vendor.findAll')
  async findAll(@Payload() payload: any): Promise<Vendor[]> {
    const { limit, offset } = payload || {};
    return this.vendorService.findAll({
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @MessagePattern('vendor.search')
  async search(@Payload() payload: any): Promise<Vendor[]> {
    const { query, location, serviceType, limit, offset } = payload || {};
    return this.vendorService.searchVendors(
      query,
      location,
      serviceType,
      limit ? parseInt(limit.toString()) : 10,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @MessagePattern('vendor.findById')
  async findById(@Payload() payload: { id: string }): Promise<Vendor> {
    return this.vendorService.findById(payload.id);
  }

  @MessagePattern('vendor.findByUserId')
  async findByUserId(@Payload() payload: { userId: string }): Promise<Vendor> {
    return this.vendorService.findByUserId(payload.userId);
  }

  @MessagePattern('vendor.create')
  async create(@Payload() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return this.vendorService.create(createVendorDto);
  }

  @MessagePattern('vendor.update')
  async update(@Payload() payload: { id: string; [key: string]: any }): Promise<Vendor> {
    const { id, ...updateData } = payload;
    return this.vendorService.update(id, updateData);
  }

  @MessagePattern('vendor.updateStatus')
  async updateStatus(@Payload() payload: { id: string; status: VendorStatus }): Promise<Vendor> {
    const { id, status } = payload;
    return this.vendorService.updateStatus(id, status);
  }

  @MessagePattern('vendor.delete')
  async delete(@Payload() payload: { id: string }): Promise<void> {
    return this.vendorService.delete(payload.id);
  }

  // Vendor Service handlers
  @MessagePattern('vendor.services.findAll')
  async findAllServices(@Payload() payload: { vendorId: string }): Promise<VendorServiceModel[]> {
    return this.vendorService.findAllServices(payload.vendorId);
  }

  @MessagePattern('vendor.services.findById')
  async findServiceById(@Payload() payload: { id: string }): Promise<VendorServiceModel> {
    return this.vendorService.findServiceById(payload.id);
  }

  @MessagePattern('vendor.services.create')
  async createService(@Payload() createServiceDto: CreateVendorServiceDto): Promise<VendorServiceModel> {
    return this.vendorService.createService(createServiceDto);
  }

  @MessagePattern('vendor.services.update')
  async updateService(@Payload() payload: { id: string; [key: string]: any }): Promise<VendorServiceModel> {
    const { id, ...updateData } = payload;
    return this.vendorService.updateService(id, updateData);
  }

  @MessagePattern('vendor.services.delete')
  async deleteService(@Payload() payload: { id: string }): Promise<void> {
    return this.vendorService.deleteService(payload.id);
  }
}
