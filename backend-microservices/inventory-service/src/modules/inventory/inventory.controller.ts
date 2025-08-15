import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('inventory')
@Controller('inventory')
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new inventory record' })
  @ApiResponse({ status: 201, description: 'The inventory record has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all inventory records' })
  @ApiResponse({ status: 200, description: 'Return all inventory records.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all low stock inventory' })
  @ApiResponse({ status: 200, description: 'Return all low stock inventory.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findLowStock() {
    return this.inventoryService.findLowStock();
  }

  @Get('out-of-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all out of stock inventory' })
  @ApiResponse({ status: 200, description: 'Return all out of stock inventory.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOutOfStock() {
    return this.inventoryService.findOutOfStock();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get an inventory record by ID' })
  @ApiResponse({ status: 200, description: 'Return the inventory record.' })
  @ApiResponse({ status: 404, description: 'Inventory record not found.' })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory for a specific product' })
  @ApiResponse({ status: 200, description: 'Return the inventory for product.' })
  @ApiResponse({ status: 404, description: 'Inventory for product not found.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  findByProductId(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Update an inventory record' })
  @ApiResponse({ status: 200, description: 'The inventory record has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Inventory record not found.' })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  update(@Param('id') id: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Patch('product/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Update inventory for a specific product' })
  @ApiResponse({ status: 200, description: 'The inventory for product has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Inventory for product not found.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  updateByProductId(@Param('productId') productId: string, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.updateByProductId(productId, updateInventoryDto);
  }

  @Patch(':id/adjust/:quantity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Adjust inventory quantity' })
  @ApiResponse({ status: 200, description: 'The inventory quantity has been successfully adjusted.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Inventory record not found.' })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  @ApiParam({ name: 'quantity', description: 'Quantity change (positive or negative)' })
  adjustQuantity(@Param('id') id: string, @Param('quantity') quantity: string) {
    return this.inventoryService.adjustQuantity(id, parseInt(quantity, 10));
  }

  @Patch('product/:productId/adjust/:quantity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Adjust inventory quantity by product ID' })
  @ApiResponse({ status: 200, description: 'The inventory quantity has been successfully adjusted.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Inventory for product not found.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiParam({ name: 'quantity', description: 'Quantity change (positive or negative)' })
  adjustQuantityByProductId(@Param('productId') productId: string, @Param('quantity') quantity: string) {
    return this.inventoryService.adjustQuantityByProductId(productId, parseInt(quantity, 10));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an inventory record' })
  @ApiResponse({ status: 200, description: 'The inventory record has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Inventory record not found.' })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
