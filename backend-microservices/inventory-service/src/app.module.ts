import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Database Module
import { DatabaseModule } from './database/database.module';

// Feature Modules
import { ProductModule } from './modules/product/product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductCategoryModule } from './modules/product-category/product-category.module';
import { MicroserviceModule } from './modules/microservice/microservice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ProductModule,
    InventoryModule,
    ProductCategoryModule,
    MicroserviceModule,
  ],
})
export class AppModule {}
