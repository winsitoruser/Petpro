import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from '../modules/product/models/product.model';
import { ProductCategory } from '../modules/product-category/models/product-category.model';
import { Inventory } from '../modules/inventory/models/inventory.model';
import { ProductCategorySeeder } from './seeders/product-category.seeder';
import { ProductSeeder } from './seeders/product.seeder';
import { InventorySeeder } from './seeders/inventory.seeder';
import { DatabaseSeeder } from './seeders/index';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Product,
      ProductCategory,
      Inventory,
    ]),
  ],
  providers: [
    ProductCategorySeeder,
    ProductSeeder,
    InventorySeeder,
    DatabaseSeeder,
  ],
  exports: [
    DatabaseSeeder,
  ],
})
export class DatabaseModule {}
