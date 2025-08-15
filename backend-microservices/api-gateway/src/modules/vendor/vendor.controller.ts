import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('vendors')
@Controller('vendors')
export class VendorController {
  constructor(
    @Inject('VENDOR_SERVICE') private readonly vendorServiceClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({ status: 200, description: 'Returns list of vendors' })
  async findAll(@Query() query: any) {
    return firstValueFrom(this.vendorServiceClient.send('vendor.findAll', query));
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for vendors' })
  @ApiResponse({ status: 200, description: 'Returns search results for vendors' })
  async search(@Query() query: any) {
    return firstValueFrom(this.vendorServiceClient.send('vendor.search', query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiResponse({ status: 200, description: 'Returns vendor details' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return firstValueFrom(this.vendorServiceClient.send('vendor.findById', { id }));
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor by user ID' })
  @ApiResponse({ status: 200, description: 'Returns vendor details' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findByUserId(@Param('userId', ParseUUIDPipe) userId: string, @CurrentUser() user: any) {
    // Check if user is accessing their own vendor profile or is admin
    if (user.role !== 'admin' && user.id !== userId) {
      throw new Error('Unauthorized: You can only access your own vendor profile');
    }
    return firstValueFrom(this.vendorServiceClient.send('vendor.findByUserId', { userId }));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createVendorDto: any, @CurrentUser() user: any) {
    const payload = { ...createVendorDto, userId: user.id };
    return firstValueFrom(this.vendorServiceClient.send('vendor.create', payload));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a vendor' })
  @ApiResponse({ status: 200, description: 'Vendor successfully updated' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateVendorDto: any, @CurrentUser() user: any) {
    const vendor = await firstValueFrom(this.vendorServiceClient.send('vendor.findById', { id }));
    
    // Check if user is updating their own vendor profile or is admin
    if (user.role !== 'admin' && vendor.userId !== user.id) {
      throw new Error('Unauthorized: You can only update your own vendor profile');
    }
    
    const payload = { id, ...updateVendorDto, userId: user.id };
    return firstValueFrom(this.vendorServiceClient.send('vendor.update', payload));
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vendor status' })
  @ApiResponse({ status: 200, description: 'Vendor status successfully updated' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    const vendor = await firstValueFrom(this.vendorServiceClient.send('vendor.findById', { id }));
    
    // Check if user is updating their own vendor profile or is admin
    if (user.role !== 'admin' && vendor.userId !== user.id) {
      throw new Error('Unauthorized: You can only update your own vendor profile');
    }
    
    return firstValueFrom(this.vendorServiceClient.send('vendor.updateStatus', { id, status }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a vendor' })
  @ApiResponse({ status: 204, description: 'Vendor successfully deleted' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return firstValueFrom(this.vendorServiceClient.send('vendor.delete', { id }));
  }

  // Vendor Service routes
  @Get(':vendorId/services')
  @ApiOperation({ summary: 'Get all services for a vendor' })
  @ApiResponse({ status: 200, description: 'Returns list of services for the vendor' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findAllServices(@Param('vendorId', ParseUUIDPipe) vendorId: string) {
    return firstValueFrom(this.vendorServiceClient.send('vendor.services.findAll', { vendorId }));
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Returns service details' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findServiceById(@Param('id', ParseUUIDPipe) id: string) {
    return firstValueFrom(this.vendorServiceClient.send('vendor.services.findById', { id }));
  }

  @Post('services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createService(@Body() createServiceDto: any, @CurrentUser() user: any) {
    // Check if vendor exists and belongs to current user
    const vendor = await firstValueFrom(this.vendorServiceClient.send('vendor.findByUserId', { userId: user.id }));
    
    if (!vendor && user.role !== 'admin') {
      throw new Error('You must have a vendor profile to create services');
    }
    
    const payload = { ...createServiceDto, vendorId: vendor.id };
    return firstValueFrom(this.vendorServiceClient.send('vendor.services.create', payload));
  }

  @Put('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service' })
  @ApiResponse({ status: 200, description: 'Service successfully updated' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async updateService(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: any,
    @CurrentUser() user: any,
  ) {
    // Get the service first to verify ownership
    const service = await firstValueFrom(this.vendorServiceClient.send('vendor.services.findById', { id }));
    
    // Check if service belongs to a vendor owned by current user or user is admin
    const vendor = await firstValueFrom(this.vendorServiceClient.send('vendor.findById', { id: service.vendorId }));
    
    if (user.role !== 'admin' && vendor.userId !== user.id) {
      throw new Error('Unauthorized: You can only update your own services');
    }
    
    const payload = { id, ...updateServiceDto };
    return firstValueFrom(this.vendorServiceClient.send('vendor.services.update', payload));
  }

  @Delete('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('vendor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a service' })
  @ApiResponse({ status: 204, description: 'Service successfully deleted' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async deleteService(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    // Get the service first to verify ownership
    const service = await firstValueFrom(this.vendorServiceClient.send('vendor.services.findById', { id }));
    
    // Check if service belongs to a vendor owned by current user or user is admin
    const vendor = await firstValueFrom(this.vendorServiceClient.send('vendor.findById', { id: service.vendorId }));
    
    if (user.role !== 'admin' && vendor.userId !== user.id) {
      throw new Error('Unauthorized: You can only delete your own services');
    }
    
    return firstValueFrom(this.vendorServiceClient.send('vendor.services.delete', { id }));
  }
}
