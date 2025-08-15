import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Product } from '../../modules/product/models/product.model';
import { ProductCategory } from '../../modules/product-category/models/product-category.model';

@Injectable()
export class ProductSeeder {
  private readonly logger = new Logger(ProductSeeder.name);
  
  constructor(
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(ProductCategory)
    private productCategoryModel: typeof ProductCategory,
  ) {}

  async seed(): Promise<void> {
    const productsCount = await this.productModel.count();
    
    if (productsCount > 0) {
      this.logger.log('Products already exist, skipping seeding');
      return;
    }

    // Get all categories to reference by name
    const categories = await this.productCategoryModel.findAll();
    const categoryMap = new Map();
    categories.forEach(category => {
      categoryMap.set(category.name, category.id);
    });

    if (categories.length === 0) {
      this.logger.warn('No product categories found, skipping product seeding');
      return;
    }

    this.logger.log('Creating products...');
    
    const products = [
      // Food Category
      {
        name: 'Premium Dry Dog Food',
        description: 'High-quality dry food for adult dogs',
        price: 45.99,
        sku: 'FD-001',
        productCategoryId: categoryMap.get('Food'),
        imageUrl: 'https://example.com/images/dog-food.jpg',
        isActive: true,
      },
      {
        name: 'Grain-Free Cat Food',
        description: 'Grain-free formula for cats with sensitive stomachs',
        price: 32.99,
        sku: 'FC-001',
        productCategoryId: categoryMap.get('Food'),
        imageUrl: 'https://example.com/images/cat-food.jpg',
        isActive: true,
      },
      {
        name: 'Puppy Growth Formula',
        description: 'Specially formulated food for growing puppies',
        price: 38.50,
        sku: 'FD-002',
        productCategoryId: categoryMap.get('Food'),
        imageUrl: 'https://example.com/images/puppy-food.jpg',
        isActive: true,
      },
      // Medications Category
      {
        name: 'Flea & Tick Prevention',
        description: 'Monthly preventative treatment for fleas and ticks',
        price: 59.99,
        sku: 'MD-001',
        productCategoryId: categoryMap.get('Medications'),
        imageUrl: 'https://example.com/images/flea-treatment.jpg',
        isActive: true,
      },
      {
        name: 'Joint Supplement',
        description: 'Glucosamine supplement for joint health',
        price: 29.99,
        sku: 'MD-002',
        productCategoryId: categoryMap.get('Medications'),
        imageUrl: 'https://example.com/images/joint-supplement.jpg',
        isActive: true,
      },
      // Toys Category
      {
        name: 'Interactive Puzzle Toy',
        description: 'Mental stimulation toy for dogs',
        price: 19.99,
        sku: 'TY-001',
        productCategoryId: categoryMap.get('Toys'),
        imageUrl: 'https://example.com/images/puzzle-toy.jpg',
        isActive: true,
      },
      {
        name: 'Feather Wand',
        description: 'Interactive feather toy for cats',
        price: 12.99,
        sku: 'TY-002',
        productCategoryId: categoryMap.get('Toys'),
        imageUrl: 'https://example.com/images/feather-wand.jpg',
        isActive: true,
      },
      // Accessories Category
      {
        name: 'Adjustable Leather Collar',
        description: 'Premium leather collar for dogs',
        price: 24.99,
        sku: 'AC-001',
        productCategoryId: categoryMap.get('Accessories'),
        imageUrl: 'https://example.com/images/leather-collar.jpg',
        isActive: true,
      },
      {
        name: 'Heated Cat Bed',
        description: 'Self-warming cat bed for cold weather',
        price: 34.99,
        sku: 'AC-002',
        productCategoryId: categoryMap.get('Accessories'),
        imageUrl: 'https://example.com/images/cat-bed.jpg',
        isActive: true,
      },
      // Grooming Category
      {
        name: 'Professional Grooming Kit',
        description: 'Complete set of grooming tools for dogs',
        price: 49.99,
        sku: 'GR-001',
        productCategoryId: categoryMap.get('Grooming'),
        imageUrl: 'https://example.com/images/grooming-kit.jpg',
        isActive: true,
      },
      {
        name: 'Deshedding Brush',
        description: 'Reduces shedding by up to 90%',
        price: 22.99,
        sku: 'GR-002',
        productCategoryId: categoryMap.get('Grooming'),
        imageUrl: 'https://example.com/images/deshedding-brush.jpg',
        isActive: true,
      },
      // Health Supplements Category
      {
        name: 'Omega-3 Fish Oil',
        description: 'Supplement for skin and coat health',
        price: 18.99,
        sku: 'HS-001',
        productCategoryId: categoryMap.get('Health Supplements'),
        imageUrl: 'https://example.com/images/fish-oil.jpg',
        isActive: true,
      },
      {
        name: 'Probiotic Digestive Support',
        description: 'Daily probiotic for digestive health',
        price: 29.99,
        sku: 'HS-002',
        productCategoryId: categoryMap.get('Health Supplements'),
        imageUrl: 'https://example.com/images/probiotic.jpg',
        isActive: true,
      },
    ];

    await this.productModel.bulkCreate(products);
    this.logger.log(`Created ${products.length} products`);
  }
}
