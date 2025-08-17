import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductCategory } from '../../models/product-category.model';

@Injectable()
export class ProductCategorySeeder {
  private readonly logger = new Logger(ProductCategorySeeder.name);
  
  constructor(
    @InjectModel(ProductCategory)
    private productCategoryModel: typeof ProductCategory,
  ) {}

  async seed(): Promise<void> {
    const categoriesCount = await this.productCategoryModel.count();
    
    if (categoriesCount > 0) {
      this.logger.log('Product categories already exist, skipping seeding');
      return;
    }

    this.logger.log('Creating product categories...');
    
    const categories = [
      {
        name: 'Food',
        description: 'Pet food products including dry food, wet food, and treats',
        isActive: true,
      },
      {
        name: 'Medications',
        description: 'Prescription and over-the-counter medications for pets',
        isActive: true,
      },
      {
        name: 'Toys',
        description: 'Interactive toys and entertainment for pets',
        isActive: true,
      },
      {
        name: 'Accessories',
        description: 'Collars, leashes, beds, and other pet accessories',
        isActive: true,
      },
      {
        name: 'Grooming',
        description: 'Grooming supplies and equipment for pets',
        isActive: true,
      },
      {
        name: 'Health Supplements',
        description: 'Vitamins and health supplements for pets',
        isActive: true,
      },
    ];

    await this.productCategoryModel.bulkCreate(categories);
    this.logger.log(`Created ${categories.length} product categories`);
  }
}
