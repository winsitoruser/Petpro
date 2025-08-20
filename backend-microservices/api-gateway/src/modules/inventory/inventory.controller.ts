import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  private readonly inventoryServiceUrl: string;
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.inventoryServiceUrl = this.configService.get<string>('INVENTORY_SERVICE_URL') || 'http://localhost:3003';
  }

  // Product Category endpoints
  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'Return all product categories.' })
  async getAllCategories(@Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/categories`, {
        params: query,
      })
    );
    return response.data;
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a product category by ID' })
  @ApiResponse({ status: 200, description: 'Return the product category.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  async getCategory(@Param('id', ParseUUIDPipe) id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/categories/${id}`)
    );
    return response.data;
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product category' })
  @ApiResponse({ status: 201, description: 'The product category has been successfully created.' })
  async createCategory(@Body() createCategoryDto: any, @CurrentUser() user: any) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.inventoryServiceUrl}/api/v1/categories`,
        createCategoryDto,
        {
          headers: { 'X-User-Id': user.id, 'Content-Type': 'application/json' },
        }
      )
    );
    return response.data;
  }

  // Product endpoints
  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products.' })
  async getAllProducts(@Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/products`, {
        params: query,
      })
    );
    return response.data;
  }

  @Get('products/search')
  @ApiOperation({ summary: 'Search products by name, description, SKU, etc.' })
  @ApiResponse({ status: 200, description: 'Return matching products.' })
  async searchProducts(@Query('query') query: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/products/search`, {
        params: { query },
      })
    );
    return response.data;
  }

  @Get('products/category/:id')
  @ApiOperation({ summary: 'Get all products by category ID' })
  @ApiResponse({ status: 200, description: 'Return all products in category.' })
  async getProductsByCategory(@Param('id', ParseUUIDPipe) id: string, @Query() query: any) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/products/category/${id}`, {
        params: query,
      })
    );
    return response.data;
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Return the product.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async getProduct(@Param('id', ParseUUIDPipe) id: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/products/${id}`)
    );
    return response.data;
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
  async createProduct(@Body() createProductDto: any, @CurrentUser() user: any) {
    const response = await firstValueFrom(
      this.httpService.post(
        `${this.inventoryServiceUrl}/api/v1/products`,
        createProductDto,
        {
          headers: { 'X-User-Id': user.id, 'Content-Type': 'application/json' },
        }
      )
    );
    return response.data;
  }

  // Inventory/Stock endpoints
  @Get('stock/product/:productId')
  @ApiOperation({ summary: 'Get inventory for a specific product' })
  @ApiResponse({ status: 200, description: 'Return the inventory for product.' })
  async getInventoryByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/inventory/product/${productId}`)
    );
    return response.data;
  }

  @Get('stock/low')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all low stock inventory' })
  @ApiResponse({ status: 200, description: 'Return all low stock inventory.' })
  async getLowStock() {
    const response = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/inventory/low-stock`)
    );
    return response.data;
  }

  @Patch('stock/product/:productId/adjust')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adjust inventory quantity by product ID' })
  @ApiResponse({ status: 200, description: 'The inventory quantity has been successfully adjusted.' })
  async adjustInventoryByProductId(
    @Param('productId', ParseUUIDPipe) productId: string, 
    @Body() adjustInventoryDto: any,
    @CurrentUser() user: any
  ) {
    const response = await firstValueFrom(
      this.httpService.patch(
        `${this.inventoryServiceUrl}/api/v1/inventory/product/${productId}/adjust`,
        adjustInventoryDto,
        {
          headers: { 'X-User-Id': user.id, 'Content-Type': 'application/json' },
        }
      )
    );
    return response.data;
  }
}