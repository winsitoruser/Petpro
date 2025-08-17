import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Inventory Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  private getToken(req: any): string {
    return req.get('Authorization')?.replace('Bearer ', '');
  }

  // Product Management
  @ApiOperation({ summary: 'Get all products' })
  @Get('products')
  async getProducts(@Request() req: any, @Query() query: any) {
    return this.inventoryService.getProducts(this.getToken(req), query);
  }

  @ApiOperation({ summary: 'Get product by ID' })
  @Get('products/:id')
  async getProductById(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.getProductById(id, this.getToken(req));
  }

  @ApiOperation({ summary: 'Create new product' })
  @Post('products')
  async createProduct(@Body() data: any, @Request() req: any) {
    return this.inventoryService.createProduct(data, this.getToken(req));
  }

  @ApiOperation({ summary: 'Update product' })
  @Put('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    return this.inventoryService.updateProduct(id, data, this.getToken(req));
  }

  @ApiOperation({ summary: 'Delete product' })
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string, @Request() req: any) {
    return this.inventoryService.deleteProduct(id, this.getToken(req));
  }

  // Inventory Management
  @ApiOperation({ summary: 'Get inventory levels' })
  @Get()
  async getInventory(@Request() req: any, @Query() query: any) {
    return this.inventoryService.getInventory(this.getToken(req), query);
  }

  @ApiOperation({ summary: 'Update inventory level' })
  @Put(':id')
  async updateInventory(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any,
  ) {
    return this.inventoryService.updateInventory(id, data, this.getToken(req));
  }
}