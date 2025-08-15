import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  NotFoundException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { 
  ProductCategoryDto, 
  CreateProductCategoryDto, 
  UpdateProductCategoryDto 
} from './dto/product-category.dto';
import { 
  ProductDto, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductStatus 
} from './dto/product.dto';
import { 
  InventoryDto, 
  UpdateInventoryDto, 
  AdjustInventoryDto 
} from './dto/inventory.dto';
import { firstValueFrom } from 'rxjs';

@ApiTags('inventory')
@Controller('inventory')
@ApiBearerAuth()
export class InventoryController {
  private inventoryClient: ClientProxy;
  
  constructor(private configService: ConfigService) {
    this.inventoryClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('INVENTORY_SERVICE_HOST', 'localhost'),
        port: parseInt(configService.get('INVENTORY_SERVICE_PORT', '3004')),
      },
    });
  }

  // Product Category endpoints
  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'Return all product categories.' })
  async getAllCategories() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_all_categories' }, {}));
  }

  @Get('categories/active')
  @ApiOperation({ summary: 'Get all active product categories' })
  @ApiResponse({ status: 200, description: 'Return all active product categories.' })
  async getActiveCategories() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_active_categories' }, {}));
  }

  @Get('categories/root')
  @ApiOperation({ summary: 'Get all root product categories (no parent)' })
  @ApiResponse({ status: 200, description: 'Return all root product categories.' })
  async getRootCategories() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_root_categories' }, {}));
  }

  @Get('categories/search')
  @ApiOperation({ summary: 'Search product categories by name or description' })
  @ApiResponse({ status: 200, description: 'Return matching product categories.' })
  @ApiQuery({ name: 'query', required: true, type: String })
  async searchCategories(@Query('query') query: string) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'search_categories' }, query));
  }

  @Get('categories/parent/:id')
  @ApiOperation({ summary: 'Get all product categories by parent ID' })
  @ApiResponse({ status: 200, description: 'Return all child product categories.' })
  @ApiParam({ name: 'id', description: 'Parent Category ID' })
  async getCategoriesByParentId(@Param('id', ParseUUIDPipe) id: string) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_child_categories' }, id));
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a product category by ID' })
  @ApiResponse({ status: 200, description: 'Return the product category.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getCategory(@Param('id', ParseUUIDPipe) id: string) {
    const result = await firstValueFrom(this.inventoryClient.send({ cmd: 'get_category' }, id));
    if (result.error) {
      throw new NotFoundException(result.error);
    }
    return result;
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product category' })
  @ApiResponse({ status: 201, description: 'The product category has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createCategory(@Body() createCategoryDto: CreateProductCategoryDto) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'create_category' }, createCategoryDto));
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a product category' })
  @ApiResponse({ status: 200, description: 'The product category has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateCategoryDto: UpdateProductCategoryDto
  ) {
    return await firstValueFrom(this.inventoryClient.send(
      { cmd: 'update_category' }, 
      { id, updateCategoryDto }
    ));
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a product category' })
  @ApiResponse({ status: 200, description: 'The product category has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async deleteCategory(@Param('id', ParseUUIDPipe) id: string) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'delete_category' }, id));
  }

  // Product endpoints
  @Get('products')
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products.' })
  async getAllProducts() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_all_products' }, {}));
  }

  @Get('products/active')
  @ApiOperation({ summary: 'Get all active products' })
  @ApiResponse({ status: 200, description: 'Return all active products.' })
  async getActiveProducts() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_active_products' }, {}));
  }

  @Get('products/featured')
  @ApiOperation({ summary: 'Get all featured products' })
  @ApiResponse({ status: 200, description: 'Return all featured products.' })
  async getFeaturedProducts() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_featured_products' }, {}));
  }

  @Get('products/search')
  @ApiOperation({ summary: 'Search products by name, description, SKU, etc.' })
  @ApiResponse({ status: 200, description: 'Return matching products.' })
  @ApiQuery({ name: 'query', required: true, type: String })
  async searchProducts(@Query('query') query: string) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'search_products' }, query));
  }

  @Get('products/category/:id')
  @ApiOperation({ summary: 'Get all products by category ID' })
  @ApiResponse({ status: 200, description: 'Return all products in category.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async getProductsByCategory(@Param('id', ParseUUIDPipe) id: string) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_products_by_category' }, id));
  }

  @Get('products/vendor/:id')
  @ApiOperation({ summary: 'Get all products by vendor ID' })
  @ApiResponse({ status: 200, description: 'Return all products from vendor.' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  async getProductsByVendor(@Param('id', ParseUUIDPipe) id: string) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_products_by_vendor' }, id));
  }

  @Get('products/low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all products with low stock' })
  @ApiResponse({ status: 200, description: 'Return all low stock products.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getLowStockProducts() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_low_stock' }, {}));
  }

  @Get('products/pet-type/:petType')
  @ApiOperation({ summary: 'Get products suitable for specific pet type' })
  @ApiResponse({ status: 200, description: 'Return pet-specific products.' })
  @ApiParam({ name: 'petType', description: 'Pet type (e.g., dog, cat, bird)' })
  async getProductsByPetType(@Param('petType') petType: string) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_products_by_pet_type' }, petType));
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Return the product.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async getProduct(@Param('id', ParseUUIDPipe) id: string) {
    const result = await firstValueFrom(this.inventoryClient.send({ cmd: 'get_product' }, id));
    if (result.error) {
      throw new NotFoundException(result.error);
    }
    return result;
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'create_product' }, createProductDto));
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto
  ) {
    return await firstValueFrom(this.inventoryClient.send(
      { cmd: 'update_product' }, 
      { id, updateProductDto }
    ));
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'delete_product' }, id));
  }

  // Inventory endpoints
  @Get('stock/product/:productId')
  @ApiOperation({ summary: 'Get inventory for a specific product' })
  @ApiResponse({ status: 200, description: 'Return the inventory for product.' })
  @ApiResponse({ status: 404, description: 'Inventory for product not found.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async getInventoryByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    const result = await firstValueFrom(this.inventoryClient.send({ cmd: 'get_product_inventory' }, productId));
    if (result.error) {
      throw new NotFoundException(result.error);
    }
    return result;
  }

  @Get('stock/low')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all low stock inventory' })
  @ApiResponse({ status: 200, description: 'Return all low stock inventory.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getLowStock() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_low_stock' }, {}));
  }

  @Get('stock/out-of-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all out of stock inventory' })
  @ApiResponse({ status: 200, description: 'Return all out of stock inventory.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getOutOfStock() {
    return await firstValueFrom(this.inventoryClient.send({ cmd: 'get_out_of_stock' }, {}));
  }

  @Patch('stock/product/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Update inventory for a specific product' })
  @ApiResponse({ status: 200, description: 'The inventory for product has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Inventory for product not found.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async updateInventoryByProductId(
    @Param('productId', ParseUUIDPipe) productId: string, 
    @Body() updateInventoryDto: UpdateInventoryDto
  ) {
    return await firstValueFrom(this.inventoryClient.send(
      { cmd: 'update_inventory' }, 
      { productId, updateInventoryDto }
    ));
  }

  @Patch('stock/product/:productId/adjust')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Adjust inventory quantity by product ID' })
  @ApiResponse({ status: 200, description: 'The inventory quantity has been successfully adjusted.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Inventory for product not found.' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async adjustInventoryByProductId(
    @Param('productId', ParseUUIDPipe) productId: string, 
    @Body() adjustInventoryDto: AdjustInventoryDto
  ) {
    return await firstValueFrom(this.inventoryClient.send(
      { cmd: 'adjust_inventory' }, 
      { productId, quantity: adjustInventoryDto.quantity }
    ));
  }
}
