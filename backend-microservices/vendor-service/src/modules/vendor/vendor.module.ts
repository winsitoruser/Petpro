import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vendor } from '../../models/vendor.model';
import { VendorService as VendorServiceModel } from '../../models/vendor-service.model';
import { VendorController } from './vendor.controller';
import { VendorMicroserviceController } from './vendor-microservice.controller';
import { VendorService } from './vendor.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Vendor, VendorServiceModel]),
  ],
  controllers: [VendorController, VendorMicroserviceController],
  providers: [VendorService],
  exports: [VendorService],
})
export class VendorModule {}
