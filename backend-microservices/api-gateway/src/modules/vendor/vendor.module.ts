import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VendorController } from './vendor.controller';

@Module({
  imports: [HttpModule],
  controllers: [VendorController],
  providers: [],
  exports: [],
})
export class VendorModule {}
