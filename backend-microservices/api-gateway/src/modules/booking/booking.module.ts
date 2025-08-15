import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BookingController } from './booking.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'BOOKING_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('BOOKING_SERVICE_HOST', 'localhost'),
            port: parseInt(configService.get('BOOKING_SERVICE_PORT', '3002')),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [BookingController],
  providers: [],
  exports: [],
})
export class BookingModule {}
