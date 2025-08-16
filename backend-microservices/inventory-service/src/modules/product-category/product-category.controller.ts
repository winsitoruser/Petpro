import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('product-categories')
@Controller('product-categories')
@ApiBearerAuth()
export class ProductCategoryController {
  constructor(private readonly productCategoryService: ProductCategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new product category' })
  @ApiResponse({ status: 201, description: 'The product category has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productCategoryService.create(createProductCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'Return all product categories.' })
  findAll() {
    return this.productCategoryService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active product categories' })
  @ApiResponse({ status: 200, description: 'Return all active product categories.' })
  findActive() {
    return this.productCategoryService.findActive();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search product categories by name or description' })
  @ApiResponse({ status: 200, description: 'Return matching product categories.' })
  @ApiQuery({ name: 'query', required: true, type: String })
  search(@Query('query') query: string) {
    return this.productCategoryService.search(query);
  }

  @Get('root')
  @ApiOperation({ summary: 'Get all root product categories (no parent)' })
  @ApiResponse({ status: 200, description: 'Return all root product categories.' })
  findRootCategories() {
    return this.productCategoryService.findRootCategories();
  }

  @Get('parent/:id')
  @ApiOperation({ summary: 'Get all product categories by parent ID' })
  @ApiResponse({ status: 200, description: 'Return all child product categories.' })
  @ApiParam({ name: 'id', description: 'Parent Category ID' })
  findByParentId(@Param('id') id: string) {
    return this.productCategoryService.findByParentId(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product category by ID' })
  @ApiResponse({ status: 200, description: 'Return the product category.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  findOne(@Param('id') id: string) {
    return this.productCategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update a product category' })
  @ApiResponse({ status: 200, description: 'The product category has been successfully updated.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  update(@Param('id') id: string, @Body() updateProductCategoryDto: UpdateProductCategoryDto) {
    return this.productCategoryService.update(id, updateProductCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a product category' })
  @ApiResponse({ status: 200, description: 'The product category has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Product category not found.' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  remove(@Param('id') id: string) {
    return this.productCategoryService.remove(id);
  }
}
