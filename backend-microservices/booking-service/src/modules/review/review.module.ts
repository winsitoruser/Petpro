import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from '../../models/review.model';
import { ReviewHelpful } from '../../models/review-helpful.model';
import { Booking } from '../../models/booking.model';
import { User } from '../../models/user.model';
import { Service } from '../../models/service.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Review, ReviewHelpful, Booking, User, Service]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
