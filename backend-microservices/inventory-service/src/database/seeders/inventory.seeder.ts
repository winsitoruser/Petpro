import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Inventory } from '../../models/inventory.model';
import { Product } from '../../models/product.model';

@Injectable()
export class InventorySeeder {
  private readonly logger = new Logger(InventorySeeder.name);
  
  constructor(
    @InjectModel(Inventory)
    private inventoryModel: typeof Inventory,
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async seed(): Promise<void> {
    const inventoryCount = await this.inventoryModel.count();
    
    if (inventoryCount > 0) {
      this.logger.log('Inventory records already exist, skipping seeding');
      return;
    }

    // Get all products to associate inventory
    const products = await this.productModel.findAll();
    
    if (products.length === 0) {
      this.logger.warn('No products found, skipping inventory seeding');
      return;
    }

    this.logger.log('Creating inventory records...');
    
    const inventoryRecords = [];
    
    // Create inventory for each product with random quantities
    for (const product of products) {
      // Generate random values for each product
      const quantity = Math.floor(Math.random() * 100) + 10; // 10-110 units
      const minStockLevel = Math.floor(Math.random() * 10) + 5; // 5-15 units
      
      inventoryRecords.push({
        productId: product.id,
        quantity,
        minStockLevel,
        lastRestocked: new Date(),
        vendorId: Math.floor(Math.random() * 5) + 1, // Random vendor ID 1-5
        warehouseLocation: `Aisle ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 20) + 1}`, // e.g. "Aisle A-12"
        isActive: true,
        notes: `Initial inventory for ${product.name}`,
      });
    }

    await this.inventoryModel.bulkCreate(inventoryRecords);
    this.logger.log(`Created ${inventoryRecords.length} inventory records`);
  }
}
