import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from '../product/product.service';
import { InventoryService } from '../inventory/inventory.service';
import { ProductCategoryService } from '../product-category/product-category.service';

@Controller()
export class InventoryMicroserviceController {
  constructor(
    private readonly productService: ProductService,
    private readonly inventoryService: InventoryService,
    private readonly categoryService: ProductCategoryService,
  ) {}

  // Product related endpoints
  @MessagePattern({ cmd: 'get_product' })
  async getProduct(@Payload() id: string) {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_all_products' })
  async getAllProducts() {
    try {
      return await this.productService.findAll();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_active_products' })
  async getActiveProducts() {
    try {
      return await this.productService.findActive();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_featured_products' })
  async getFeaturedProducts() {
    try {
      return await this.productService.findFeatured();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_products_by_category' })
  async getProductsByCategory(@Payload() categoryId: string) {
    try {
      return await this.productService.findByCategory(categoryId);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_products_by_vendor' })
  async getProductsByVendor(@Payload() vendorId: string) {
    try {
      return await this.productService.findByVendor(vendorId);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_products_by_pet_type' })
  async getProductsByPetType(@Payload() petType: string) {
    try {
      return await this.productService.findByPetType(petType);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'search_products' })
  async searchProducts(@Payload() query: string) {
    try {
      return await this.productService.search(query);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'create_product' })
  async createProduct(@Payload() createProductDto: any) {
    try {
      return await this.productService.create(createProductDto);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'update_product' })
  async updateProduct(@Payload() data: { id: string; updateProductDto: any }) {
    try {
      return await this.productService.update(data.id, data.updateProductDto);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'delete_product' })
  async deleteProduct(@Payload() id: string) {
    try {
      await this.productService.remove(id);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Inventory related endpoints
  @MessagePattern({ cmd: 'get_inventory' })
  async getInventory(@Payload() id: string) {
    try {
      return await this.inventoryService.findOne(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_product_inventory' })
  async getProductInventory(@Payload() productId: string) {
    try {
      return await this.inventoryService.findByProductId(productId);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_low_stock' })
  async getLowStock() {
    try {
      return await this.inventoryService.findLowStock();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_out_of_stock' })
  async getOutOfStock() {
    try {
      return await this.inventoryService.findOutOfStock();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'adjust_inventory' })
  async adjustInventory(@Payload() data: { productId: string; quantity: number }) {
    try {
      return await this.inventoryService.adjustQuantityByProductId(data.productId, data.quantity);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'update_inventory' })
  async updateInventory(@Payload() data: { productId: string; updateInventoryDto: any }) {
    try {
      return await this.inventoryService.updateByProductId(data.productId, data.updateInventoryDto);
    } catch (error) {
      return { error: error.message };
    }
  }

  // Category related endpoints
  @MessagePattern({ cmd: 'get_all_categories' })
  async getAllCategories() {
    try {
      return await this.categoryService.findAll();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_active_categories' })
  async getActiveCategories() {
    try {
      return await this.categoryService.findActive();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_category' })
  async getCategory(@Payload() id: string) {
    try {
      return await this.categoryService.findOne(id);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_root_categories' })
  async getRootCategories() {
    try {
      return await this.categoryService.findRootCategories();
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'get_child_categories' })
  async getChildCategories(@Payload() parentId: string) {
    try {
      return await this.categoryService.findByParentId(parentId);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'create_category' })
  async createCategory(@Payload() createCategoryDto: any) {
    try {
      return await this.categoryService.create(createCategoryDto);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'update_category' })
  async updateCategory(@Payload() data: { id: string; updateCategoryDto: any }) {
    try {
      return await this.categoryService.update(data.id, data.updateCategoryDto);
    } catch (error) {
      return { error: error.message };
    }
  }

  @MessagePattern({ cmd: 'delete_category' })
  async deleteCategory(@Payload() id: string) {
    try {
      await this.categoryService.remove(id);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }
}
