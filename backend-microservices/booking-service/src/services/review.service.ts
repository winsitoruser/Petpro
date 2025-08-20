import { Review } from '../models/review.model';
import { ReviewHelpful } from '../models/review-helpful.model';
import { Booking } from '../models/booking.model';
import { User } from '../models/user.model';
import { Service } from '../models/service.model';
import { Op, Sequelize } from 'sequelize';
import logger from '../utils/logger';

interface FilterOptions {
  sort?: string;
  filter?: string;
  limit: number;
  offset: number;
}

/**
 * Create a new review for a completed booking
 * @param userId Customer user ID
 * @param bookingId Booking ID to review
 * @param rating Rating (1-5)
 * @param review Review text
 * @param anonymous Whether to display customer name
 * @returns Operation result with created review or error message
 */
export const createReview = async (
  userId: string,
  bookingId: string,
  rating: number,
  review: string,
  anonymous: boolean = false
) => {
  try {
    // Check if booking exists and belongs to customer
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        customerId: userId
      }
    });

    if (!booking) {
      return { success: false, message: 'Booking not found or does not belong to this customer' };
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return { success: false, message: 'Only completed bookings can be reviewed' };
    }

    // Check if booking is already reviewed
    const existingReview = await Review.findOne({
      where: { bookingId }
    });

    if (existingReview) {
      return { success: false, message: 'This booking has already been reviewed' };
    }

    // Create the review
    const newReview = await Review.create({
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

    // Update vendor rating statistics (would typically be done in a transaction)
    await updateVendorRatingStatistics(booking.vendorId);

    const createdReview = await Review.findByPk(newReview.id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: Service,
              as: 'service',
              attributes: ['id', 'name', 'category']
            }
          ]
        }
      ]
    });

    return { success: true, review: createdReview };
  } catch (error) {
    logger.error('Error in createReview service', { error, userId, bookingId });
    throw error;
  }
};

/**
 * Update an existing review
 * @param userId Customer user ID
 * @param reviewId Review ID to update
 * @param rating Updated rating
 * @param review Updated review text
 * @param anonymous Updated anonymous setting
 * @returns Operation result with updated review or error message
 */
export const updateReview = async (
  userId: string,
  reviewId: string,
  rating?: number,
  review?: string,
  anonymous?: boolean
) => {
  try {
    // Find the review
    const existingReview = await Review.findOne({
      where: {
        id: reviewId,
        customerId: userId
      }
    });

    if (!existingReview) {
      return { success: false, message: 'Review not found or does not belong to this customer' };
    }

    // Check if review was created more than 72 hours ago (3 days limit for edits)
    const createdAt = new Date(existingReview.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 72) {
      return { success: false, message: 'Reviews can only be edited within 72 hours of creation' };
    }

    // Update the review
    const updateData: any = {};
    
    if (rating !== undefined) {
      updateData.rating = rating;
    }
    
    if (review !== undefined) {
      updateData.review = review;
    }
    
    if (anonymous !== undefined) {
      updateData.anonymous = anonymous;
    }
    
    await existingReview.update(updateData);

    // Update vendor rating statistics
    await updateVendorRatingStatistics(existingReview.vendorId);

    const updatedReview = await Review.findByPk(reviewId, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: Service,
              as: 'service',
              attributes: ['id', 'name', 'category']
            }
          ]
        }
      ]
    });

    return { success: true, review: updatedReview };
  } catch (error) {
    logger.error('Error in updateReview service', { error, userId, reviewId });
    throw error;
  }
};

/**
 * Delete a review
 * @param userId Customer user ID
 * @param reviewId Review ID to delete
 * @returns Operation result
 */
export const deleteReview = async (userId: string, reviewId: string) => {
  try {
    // Find the review
    const review = await Review.findOne({
      where: {
        id: reviewId,
        customerId: userId
      }
    });

    if (!review) {
      return { success: false, message: 'Review not found or does not belong to this customer' };
    }

    // Check if review was created more than 72 hours ago (3 days limit for deletion)
    const createdAt = new Date(review.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 72) {
      return { success: false, message: 'Reviews can only be deleted within 72 hours of creation' };
    }

    const vendorId = review.vendorId;
    const bookingId = review.bookingId;

    // Delete review helpful entries
    await ReviewHelpful.destroy({
      where: { reviewId }
    });

    // Delete the review
    await review.destroy();

    // Update the booking to mark as not reviewed
    await Booking.update(
      { reviewed: false },
      {
        where: { id: bookingId }
      }
    );

    // Update vendor rating statistics
    await updateVendorRatingStatistics(vendorId);

    return { success: true };
  } catch (error) {
    logger.error('Error in deleteReview service', { error, userId, reviewId });
    throw error;
  }
};

/**
 * Get reviews for a vendor with filtering options
 * @param vendorId Vendor user ID
 * @param filterOptions Filter options (sort, filter, pagination)
 * @returns List of reviews and metadata
 */
export const getVendorReviews = async (vendorId: string, filterOptions: FilterOptions) => {
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
    let order: any = [['createdAt', 'DESC']]; // Default sort by most recent
    
    if (sort === 'helpful') {
      order = [['helpfulCount', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'rating_high') {
      order = [['rating', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'rating_low') {
      order = [['rating', 'ASC'], ['createdAt', 'DESC']];
    }
    
    const reviews = await Review.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: Service,
              as: 'service',
              attributes: ['id', 'name', 'category']
            }
          ]
        }
      ]
    });

    // Don't show customer details if review is anonymous
    reviews.rows.forEach(review => {
      if (review.anonymous && review.customer) {
        review.customer.firstName = 'Anonymous';
        review.customer.lastName = 'Customer';
        review.customer.profileImage = null;
      }
    });

    return {
      total: reviews.count,
      offset,
      limit,
      reviews: reviews.rows
    };
  } catch (error) {
    logger.error('Error in getVendorReviews service', { error, vendorId });
    throw error;
  }
};

/**
 * Get rating summary statistics for a vendor
 * @param vendorId Vendor user ID
 * @returns Summary of vendor ratings
 */
export const getVendorReviewSummary = async (vendorId: string) => {
  try {
    // Get total number of reviews
    const totalReviews = await Review.count({
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
    const ratingSum = await Review.sum('rating', {
      where: { vendorId }
    });

    const averageRating = ratingSum / totalReviews;

    // Get rating distribution
    const ratingDistribution = await Review.findAll({
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
      distribution[item.rating] = parseInt(item.get('count').toString(), 10);
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution: distribution
    };
  } catch (error) {
    logger.error('Error in getVendorReviewSummary service', { error, vendorId });
    throw error;
  }
};

/**
 * Mark a review as helpful
 * @param userId User ID marking the review
 * @param reviewId Review ID to mark
 * @returns Operation result
 */
export const markReviewHelpful = async (userId: string, reviewId: string) => {
  try {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return { success: false, message: 'Review not found' };
    }

    // Check if user has already marked this review as helpful
    const existingMark = await ReviewHelpful.findOne({
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

      return { success: true, helpful: false, helpfulCount: review.helpfulCount - 1 };
    } else {
      // Add new helpful mark
      await ReviewHelpful.create({
        reviewId,
        userId
      });

      // Increment helpful count
      await review.update({
        helpfulCount: review.helpfulCount + 1
      });

      return { success: true, helpful: true, helpfulCount: review.helpfulCount + 1 };
    }
  } catch (error) {
    logger.error('Error in markReviewHelpful service', { error, userId, reviewId });
    throw error;
  }
};

/**
 * Get all reviews written by a customer
 * @param userId Customer user ID
 * @param filterOptions Filter options (pagination)
 * @returns List of customer's reviews
 */
export const getCustomerReviews = async (userId: string, filterOptions: { limit: number, offset: number }) => {
  try {
    const { limit = 10, offset = 0 } = filterOptions;
    
    const reviews = await Review.findAndCountAll({
      where: { customerId: userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'profileImage']
        },
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: Service,
              as: 'service',
              attributes: ['id', 'name', 'category']
            }
          ]
        }
      ]
    });

    return {
      total: reviews.count,
      offset,
      limit,
      reviews: reviews.rows
    };
  } catch (error) {
    logger.error('Error in getCustomerReviews service', { error, userId });
    throw error;
  }
};

/**
 * Get a review by ID
 * @param reviewId Review ID
 * @returns Review details or null if not found
 */
export const getReviewById = async (reviewId: string) => {
  try {
    const review = await Review.findByPk(reviewId, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'profileImage']
        },
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: Service,
              as: 'service',
              attributes: ['id', 'name', 'category']
            }
          ]
        }
      ]
    });

    // Don't show customer details if review is anonymous
    if (review && review.anonymous && review.customer) {
      review.customer.firstName = 'Anonymous';
      review.customer.lastName = 'Customer';
      review.customer.profileImage = null;
    }

    return review;
  } catch (error) {
    logger.error('Error in getReviewById service', { error, reviewId });
    throw error;
  }
};

/**
 * Get all reviews for a specific booking
 * @param bookingId Booking ID
 * @returns List of reviews for the booking
 */
export const getBookingReviews = async (bookingId: string) => {
  try {
    const reviews = await Review.findAll({
      where: { bookingId },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ]
    });

    // Don't show customer details if review is anonymous
    reviews.forEach(review => {
      if (review.anonymous && review.customer) {
        review.customer.firstName = 'Anonymous';
        review.customer.lastName = 'Customer';
        review.customer.profileImage = null;
      }
    });

    return reviews;
  } catch (error) {
    logger.error('Error in getBookingReviews service', { error, bookingId });
    throw error;
  }
};

/**
 * Update vendor rating statistics based on reviews
 * @param vendorId Vendor user ID
 */
const updateVendorRatingStatistics = async (vendorId: string) => {
  try {
    // Get total number of reviews
    const totalReviews = await Review.count({
      where: { vendorId }
    });

    if (totalReviews === 0) {
      // Reset vendor ratings to 0
      await User.update(
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
    const ratingSum = await Review.sum('rating', {
      where: { vendorId }
    });

    const averageRating = parseFloat((ratingSum / totalReviews).toFixed(1));

    // Update vendor with new rating data
    await User.update(
      {
        averageRating,
        totalReviews
      },
      {
        where: { id: vendorId }
      }
    );
  } catch (error) {
    logger.error('Error in updateVendorRatingStatistics service', { error, vendorId });
    throw error;
  }
};
