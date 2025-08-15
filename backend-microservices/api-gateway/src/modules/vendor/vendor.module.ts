import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VendorController } from './vendor.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'VENDOR_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('VENDOR_SERVICE_HOST', 'localhost'),
            port: parseInt(configService.get('VENDOR_SERVICE_PORT', '3004')),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [VendorController],
  providers: [],
  exports: [],
})
export class VendorModule {}
