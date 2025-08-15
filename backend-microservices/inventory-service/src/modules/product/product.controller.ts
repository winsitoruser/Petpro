import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('products')
@Controller('products')
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products.' })
  findAll() {
    return this.productService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active products' })
  @ApiResponse({ status: 200, description: 'Return all active products.' })
  findActive() {
    return this.productService.findActive();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get all featured products' })
  @ApiResponse({ status: 200, description: 'Return all featured products.' })
  findFeatured() {
    return this.productService.findFeatured();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name, description, SKU, etc.' })
  @ApiResponse({ status: 200, description: 'Return matching products.' })
  @ApiQuery({ name: 'query', required: true, type: String })
  search(@Query('query') query: string) {
    return this.productService.search(query);
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get all products by category ID' })
  @ApiResponse({ status: 200, description: 'Return all products in category.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  findByCategory(@Param('id') id: string) {
    return this.productService.findByCategory(id);
  }

  @Get('vendor/:id')
  @ApiOperation({ summary: 'Get all products by vendor ID' })
  @ApiResponse({ status: 200, description: 'Return all products from vendor.' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  findByVendor(@Param('id') id: string) {
    return this.productService.findByVendor(id);
  }

  @Get('low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Get all products with low stock' })
  @ApiResponse({ status: 200, description: 'Return all low stock products.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findLowStock() {
    return this.productService.findLowStock();
  }

  @Get('pet-type/:petType')
  @ApiOperation({ summary: 'Get products suitable for specific pet type' })
  @ApiResponse({ status: 200, description: 'Return pet-specific products.' })
  @ApiParam({ name: 'petType', description: 'Pet type (e.g., dog, cat, bird)' })
  findByPetType(@Param('petType') petType: string) {
    return this.productService.findByPetType(petType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Return the product.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
