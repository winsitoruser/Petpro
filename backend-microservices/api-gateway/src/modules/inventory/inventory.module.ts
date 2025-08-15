import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [ConfigModule],
  controllers: [InventoryController],
})
export class InventoryModule {}
