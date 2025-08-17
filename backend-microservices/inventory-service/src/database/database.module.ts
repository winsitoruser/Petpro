import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Product } from '../models/product.model';
import { ProductCategory } from '../models/product-category.model';
import { Inventory } from '../models/inventory.model';
import { ProductCategorySeeder } from './seeders/product-category.seeder';
import { ProductSeeder } from './seeders/product.seeder';
import { InventorySeeder } from './seeders/inventory.seeder';
import { DatabaseSeeder } from './seeders/index';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: +configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || 'postgres',
        database: configService.get('DB_DATABASE') || 'petpro_product_dev',
        models: [Product, ProductCategory, Inventory],
        autoLoadModels: true,
        synchronize: false,
        logging: false,
      }),
    }),
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
