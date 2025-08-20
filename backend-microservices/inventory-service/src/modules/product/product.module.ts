import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from '../../models/product.model';
import { Inventory } from '../../models/inventory.model';
import { ProductCategory } from '../../models/product-category.model';

@Module({
  imports: [SequelizeModule.forFeature([Product, Inventory, ProductCategory])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}