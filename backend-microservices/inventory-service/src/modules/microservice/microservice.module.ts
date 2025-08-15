import { Module } from '@nestjs/common';
import { InventoryMicroserviceController } from './inventory.microservice.controller';
import { ProductModule } from '../product/product.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductCategoryModule } from '../product-category/product-category.module';

@Module({
  imports: [
    ProductModule,
    InventoryModule,
    ProductCategoryModule,
  ],
  controllers: [InventoryMicroserviceController],
})
export class MicroserviceModule {}
