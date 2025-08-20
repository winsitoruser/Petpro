import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BookingController } from './booking.controller';

@Module({
  imports: [HttpModule],
  controllers: [BookingController],
  providers: [],
  exports: [],
})
export class BookingModule {}
