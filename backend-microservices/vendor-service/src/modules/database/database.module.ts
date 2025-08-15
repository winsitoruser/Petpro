import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vendor } from '../../models/vendor.model';
import { VendorService } from '../../models/vendor-service.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Vendor,
      VendorService
    ]),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
