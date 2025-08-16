import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Review } from '../../models/review.model';
import { ReviewHelpful } from '../../models/review-helpful.model';
import { Booking } from '../../models/booking.model';
import { User } from '../../models/user.model';
import { Service } from '../../models/service.model';

interface FilterOptions {
  sort?: string;
  filter?: string;
  limit: number;
  offset: number;
}

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectModel(Review)
    private reviewModel: typeof Review,
    @InjectModel(ReviewHelpful)
    private reviewHelpfulModel: typeof ReviewHelpful,
    @InjectModel(Booking)
    private bookingModel: typeof Booking,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Service)
    private serviceModel: typeof Service,
  ) {}

  /**
   * Create a new review for a completed booking
   */
  async createReview(
    userId: string,
    bookingId: string,
    rating: number,
    review: string,
    anonymous: boolean = false
  ) {
    try {
      // Check if booking exists and belongs to customer
      const booking = await this.bookingModel.findOne({
        where: {
          id: bookingId,
          customerId: userId
        }
      });

      if (!booking) {
        throw new BadRequestException('Booking not found or does not belong to this customer');
      }

      // Check if booking is completed
      if (booking.status !== 'completed') {
        throw new BadRequestException('Only completed bookings can be reviewed');
      }

      // Check if booking is already reviewed
      const existingReview = await this.reviewModel.findOne({
        where: { bookingId }
      });

      if (existingReview) {
        throw new BadRequestException('This booking has already been reviewed');
      }

      // Create the review
      const newReview = await this.reviewModel.create({
        bookingId,
        customerId: userId,
        vendorId: booking.vendorId,
        serviceId: booking.serviceId,
        rating,
        review,
        anonymous,
        helpfulCount: 0,
        status: 'published'
      });

      // Update booking to mark as reviewed
      await booking.update({ reviewed: true });

      // Update vendor rating statistics
      await this.updateVendorRatingStatistics(booking.vendorId);

      // Return the created review with related data
      return await this.reviewModel.findByPk(newReview.id, {
        include: [
          {
            model: this.bookingModel,
            as: 'booking',
            include: [
              {
                model: this.serviceModel,
                as: 'service',
                attributes: ['id', 'name', 'type']
              }
            ]
          }
        ]
      });
    } catch (error) {
      this.logger.error(`Error creating review: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create review');
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(
    userId: string,
    reviewId: string,
    rating?: number,
    reviewContent?: string,
    anonymous?: boolean
  ) {
    try {
      // Find the review
      const existingReview = await this.reviewModel.findOne({
        where: {
          id: reviewId,
          customerId: userId
        }
      });

      if (!existingReview) {
        throw new BadRequestException('Review not found or does not belong to this customer');
      }

      // Check if review was created more than 72 hours ago (3 days limit for edits)
      const createdAt = new Date(existingReview.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 72) {
        throw new BadRequestException('Reviews can only be edited within 72 hours of creation');
      }

      // Update the review
      const updateData: any = {};
      
      if (rating !== undefined) {
        updateData.rating = rating;
      }
      
      if (reviewContent !== undefined) {
        updateData.review = reviewContent;
      }
      
      if (anonymous !== undefined) {
        updateData.anonymous = anonymous;
      }
      
      await existingReview.update(updateData);

      // Update vendor rating statistics
      await this.updateVendorRatingStatistics(existingReview.vendorId);

      // Return the updated review with related data
      return await this.reviewModel.findByPk(reviewId, {
        include: [
          {
            model: this.bookingModel,
            as: 'booking',
            include: [
              {
                model: this.serviceModel,
                as: 'service',
                attributes: ['id', 'name', 'type']
              }
            ]
          }
        ]
      });
    } catch (error) {
      this.logger.error(`Error updating review: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update review');
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(userId: string, reviewId: string) {
    try {
      // Find the review
      const review = await this.reviewModel.findOne({
        where: {
          id: reviewId,
          customerId: userId
        }
      });

      if (!review) {
        throw new BadRequestException('Review not found or does not belong to this customer');
      }

      // Check if review was created more than 72 hours ago (3 days limit for deletion)
      const createdAt = new Date(review.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 72) {
        throw new BadRequestException('Reviews can only be deleted within 72 hours of creation');
      }

      const vendorId = review.vendorId;
      const bookingId = review.bookingId;

      // Delete review helpful entries
      await this.reviewHelpfulModel.destroy({
        where: { reviewId }
      });

      // Delete the review
      await review.destroy();

      // Update the booking to mark as not reviewed
      await this.bookingModel.update(
        { reviewed: false },
        {
          where: { id: bookingId }
        }
      );

      // Update vendor rating statistics
      await this.updateVendorRatingStatistics(vendorId);

      return { message: 'Review deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting review: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete review');
    }
  }

  /**
   * Get reviews for a vendor with filtering options
   */
  async getVendorReviews(vendorId: string, filterOptions: FilterOptions) {
    try {
      const { sort = 'recent', filter = 'all', limit = 10, offset = 0 } = filterOptions;
      const whereClause: any = { vendorId };
      
      // Apply filter
      if (filter === 'positive') {
        whereClause.rating = { [Op.gte]: 4 }; // 4 or 5 stars
      } else if (filter === 'negative') {
        whereClause.rating = { [Op.lte]: 2 }; // 1 or 2 stars
      } else if (filter === 'neutral') {
        whereClause.rating = 3; // 3 stars
      }
      
      // Set up sort order
      let order = [['createdAt', 'DESC']]; // Default sort by most recent
      
      if (sort === 'helpful') {
        order = [['helpfulCount', 'DESC'], ['createdAt', 'DESC']];
      } else if (sort === 'rating_high') {
        order = [['rating', 'DESC'], ['createdAt', 'DESC']];
      } else if (sort === 'rating_low') {
        order = [['rating', 'ASC'], ['createdAt', 'DESC']];
      }
      
      const { rows, count } = await this.reviewModel.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order,
        include: [
          {
            model: this.userModel,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'profileImage']
          },
          {
            model: this.bookingModel,
            as: 'booking',
            include: [
              {
                model: this.serviceModel,
                as: 'service',
                attributes: ['id', 'name', 'type']
              }
            ]
          }
        ]
      });

      // Don't show customer details if review is anonymous
      const reviews = rows.map(review => {
        const reviewJson = review.toJSON();
        if (reviewJson.anonymous && reviewJson.customer) {
          reviewJson.customer.firstName = 'Anonymous';
          reviewJson.customer.lastName = 'Customer';
          reviewJson.customer.profileImage = null;
        }
        return reviewJson;
      });

      return {
        total: count,
        offset,
        limit,
        reviews
      };
    } catch (error) {
      this.logger.error(`Error in getVendorReviews: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch vendor reviews');
    }
  }

  /**
   * Get rating summary statistics for a vendor
   */
  async getVendorReviewSummary(vendorId: string) {
    try {
      // Get total number of reviews
      const totalReviews = await this.reviewModel.count({
        where: { vendorId }
      });

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
          }
        };
      }

      // Calculate average rating
      const ratingSum = await this.reviewModel.sum('rating', {
        where: { vendorId }
      });

      const averageRating = parseFloat((ratingSum / totalReviews).toFixed(1));

      // Get rating distribution
      const ratingDistribution = await this.reviewModel.findAll({
        where: { vendorId },
        attributes: [
          'rating',
          [Sequelize.fn('COUNT', Sequelize.col('rating')), 'count']
        ],
        group: ['rating']
      });

      // Format distribution into expected structure
      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      };

      ratingDistribution.forEach(item => {
        const itemJson = item.toJSON();
        distribution[itemJson.rating] = parseInt(itemJson.count.toString(), 10);
      });

      return {
        averageRating,
        totalReviews,
        ratingDistribution: distribution
      };
    } catch (error) {
      this.logger.error(`Error in getVendorReviewSummary: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch vendor review summary');
    }
  }

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(userId: string, reviewId: string) {
    try {
      const review = await this.reviewModel.findByPk(reviewId);
      if (!review) {
        throw new NotFoundException('Review not found');
      }

      // Check if user has already marked this review as helpful
      const existingMark = await this.reviewHelpfulModel.findOne({
        where: {
          reviewId,
          userId
        }
      });

      if (existingMark) {
        // If already marked, remove the helpful mark (toggle behavior)
        await existingMark.destroy();
        
        // Decrement helpful count
        await review.update({
          helpfulCount: Math.max(0, review.helpfulCount - 1)
        });

        return { 
          message: 'Review marked as not helpful', 
          helpful: false, 
          helpfulCount: review.helpfulCount 
        };
      } else {
        // Add new helpful mark
        await this.reviewHelpfulModel.create({
          reviewId,
          userId
        });

        // Increment helpful count
        await review.update({
          helpfulCount: review.helpfulCount + 1
        });

        return { 
          message: 'Review marked as helpful', 
          helpful: true, 
          helpfulCount: review.helpfulCount 
        };
      }
    } catch (error) {
      this.logger.error(`Error in markReviewHelpful: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to mark review as helpful');
    }
  }

  /**
   * Get all reviews written by a customer
   */
  async getCustomerReviews(userId: string, filterOptions: { limit: number, offset: number }) {
    try {
      const { limit = 10, offset = 0 } = filterOptions;
      
      const { rows, count } = await this.reviewModel.findAndCountAll({
        where: { customerId: userId },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: this.userModel,
            as: 'vendor',
            attributes: ['id', 'firstName', 'lastName', 'businessName', 'profileImage']
          },
          {
            model: this.bookingModel,
            as: 'booking',
            include: [
              {
                model: this.serviceModel,
                as: 'service',
                attributes: ['id', 'name', 'type']
              }
            ]
          }
        ]
      });

      return {
        total: count,
        offset,
        limit,
        reviews: rows
      };
    } catch (error) {
      this.logger.error(`Error in getCustomerReviews: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch customer reviews');
    }
  }

  /**
   * Get a review by ID
   */
  async getReviewById(reviewId: string) {
    try {
      const review = await this.reviewModel.findByPk(reviewId, {
        include: [
          {
            model: this.userModel,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'profileImage']
          },
          {
            model: this.userModel,
            as: 'vendor',
            attributes: ['id', 'firstName', 'lastName', 'businessName', 'profileImage']
          },
          {
            model: this.bookingModel,
            as: 'booking',
            include: [
              {
                model: this.serviceModel,
                as: 'service',
                attributes: ['id', 'name', 'type']
              }
            ]
          }
        ]
      });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      // Don't show customer details if review is anonymous
      const reviewJson = review.toJSON();
      if (reviewJson.anonymous && reviewJson.customer) {
        reviewJson.customer.firstName = 'Anonymous';
        reviewJson.customer.lastName = 'Customer';
        reviewJson.customer.profileImage = null;
      }

      return reviewJson;
    } catch (error) {
      this.logger.error(`Error in getReviewById: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch review');
    }
  }

  /**
   * Get all reviews for a specific booking
   */
  async getBookingReviews(bookingId: string) {
    try {
      const reviews = await this.reviewModel.findAll({
        where: { bookingId },
        include: [
          {
            model: this.userModel,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'profileImage']
          }
        ]
      });

      // Don't show customer details if review is anonymous
      return reviews.map(review => {
        const reviewJson = review.toJSON();
        if (reviewJson.anonymous && reviewJson.customer) {
          reviewJson.customer.firstName = 'Anonymous';
          reviewJson.customer.lastName = 'Customer';
          reviewJson.customer.profileImage = null;
        }
        return reviewJson;
      });
    } catch (error) {
      this.logger.error(`Error in getBookingReviews: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch booking reviews');
    }
  }

  /**
   * Update vendor rating statistics based on reviews
   */
  private async updateVendorRatingStatistics(vendorId: string) {
    try {
      // Get total number of reviews
      const totalReviews = await this.reviewModel.count({
        where: { vendorId }
      });

      if (totalReviews === 0) {
        // Reset vendor ratings to 0
        await this.userModel.update(
          {
            averageRating: 0,
            totalReviews: 0
          },
          {
            where: { id: vendorId }
          }
        );
        return;
      }

      // Calculate average rating
      const ratingSum = await this.reviewModel.sum('rating', {
        where: { vendorId }
      });

      const averageRating = parseFloat((ratingSum / totalReviews).toFixed(1));

      // Update vendor with new rating data
      await this.userModel.update(
        {
          averageRating,
          totalReviews
        },
        {
          where: { id: vendorId }
        }
      );
    } catch (error) {
      this.logger.error(`Error in updateVendorRatingStatistics: ${error.message}`, error.stack);
      // Don't throw here to avoid breaking the main flow
    }
  }
}
