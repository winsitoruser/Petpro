import { Logger } from '@nestjs/common';
import { ProductCategorySeeder } from './product-category.seeder';
import { ProductSeeder } from './product.seeder';
import { InventorySeeder } from './inventory.seeder';

export class DatabaseSeeder {
  private readonly logger = new Logger('DatabaseSeeder');
  
  constructor(
    private readonly productCategorySeeder: ProductCategorySeeder,
    private readonly productSeeder: ProductSeeder,
    private readonly inventorySeeder: InventorySeeder,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding...');
    
    // Seed in proper order (categories first, then products, then inventory)
    await this.seedProductCategories();
    await this.seedProducts();
    await this.seedInventory();
    
    this.logger.log('Database seeding completed successfully');
  }

  async seedProductCategories() {
    this.logger.log('Seeding product categories...');
    await this.productCategorySeeder.seed();
  }

  async seedProducts() {
    this.logger.log('Seeding products...');
    await this.productSeeder.seed();
  }

  async seedInventory() {
    this.logger.log('Seeding inventory...');
    await this.inventorySeeder.seed();
  }
}
