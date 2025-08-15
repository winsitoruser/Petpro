import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreateVendorServiceDto } from './dto/create-vendor-service.dto';
import { Vendor, VendorStatus } from '../../models/vendor.model';
import { VendorService as VendorServiceModel } from '../../models/vendor-service.model';

@ApiTags('vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({
    status: 200,
    description: 'List of all vendors',
    type: [Vendor],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<Vendor[]> {
    return this.vendorService.findAll({
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for vendors' })
  @ApiResponse({
    status: 200,
    description: 'Search results for vendors',
    type: [Vendor],
  })
  @ApiQuery({ name: 'query', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'serviceType', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async search(
    @Query('query') query?: string,
    @Query('location') location?: string,
    @Query('serviceType') serviceType?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<Vendor[]> {
    return this.vendorService.searchVendors(
      query,
      location,
      serviceType,
      limit ? parseInt(limit.toString()) : 10,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiResponse({
    status: 200,
    description: 'Vendor details',
    type: Vendor,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Vendor> {
    return this.vendorService.findById(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get vendor by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Vendor details',
    type: Vendor,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  @ApiParam({ name: 'userId', description: 'User ID from auth service' })
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<Vendor> {
    return this.vendorService.findByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({
    status: 201,
    description: 'Vendor created successfully',
    type: Vendor,
  })
  @ApiBody({ type: CreateVendorDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return this.vendorService.create(createVendorDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({
    status: 200,
    description: 'Vendor updated successfully',
    type: Vendor,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiBody({ type: Vendor })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<Vendor>,
  ): Promise<Vendor> {
    return this.vendorService.update(id, updateData);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update vendor status' })
  @ApiResponse({
    status: 200,
    description: 'Vendor status updated successfully',
    type: Vendor,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(VendorStatus),
          example: VendorStatus.ACTIVE,
        },
      },
    },
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: VendorStatus,
  ): Promise<Vendor> {
    return this.vendorService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiResponse({
    status: 204,
    description: 'Vendor deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.vendorService.delete(id);
  }

  // Vendor Service routes
  @Get(':vendorId/services')
  @ApiOperation({ summary: 'Get all services for a vendor' })
  @ApiResponse({
    status: 200,
    description: 'List of services for the vendor',
    type: [VendorServiceModel],
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  async findAllServices(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<VendorServiceModel[]> {
    return this.vendorService.findAllServices(vendorId);
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({
    status: 200,
    description: 'Service details',
    type: VendorServiceModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async findServiceById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VendorServiceModel> {
    return this.vendorService.findServiceById(id);
  }

  @Post('services')
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({
    status: 201,
    description: 'Service created successfully',
    type: VendorServiceModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Vendor not found',
  })
  @ApiBody({ type: CreateVendorServiceDto })
  @HttpCode(HttpStatus.CREATED)
  async createService(
    @Body() createServiceDto: CreateVendorServiceDto,
  ): Promise<VendorServiceModel> {
    return this.vendorService.createService(createServiceDto);
  }

  @Put('services/:id')
  @ApiOperation({ summary: 'Update a service' })
  @ApiResponse({
    status: 200,
    description: 'Service updated successfully',
    type: VendorServiceModel,
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiParam({ name: 'id', description: 'Service ID' })
  async updateService(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<VendorServiceModel>,
  ): Promise<VendorServiceModel> {
    return this.vendorService.updateService(id, updateData);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiResponse({
    status: 204,
    description: 'Service deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Service not found',
  })
  @ApiParam({ name: 'id', description: 'Service ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteService(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.vendorService.deleteService(id);
  }
}
