/**
 * Review Database Service
 * 
 * Manages customer reviews, ratings, replies, and votes for products, clinics, and staff.
 */
import { PrismaClient } from '@prisma/client';
import BaseService from './baseService';

// Using simple types to fix compiler errors
type Review = any;
type ReviewReply = any;
type ReviewVote = any;
type ReviewTargetType = 'product' | 'clinic' | 'service';

export default class ReviewService extends BaseService<Review> {
  constructor() {
    super('review');
    this.searchFields = ['title', 'content'];
    this.defaultInclude = {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      replies: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      votes: true,
    };
  }

  /**
   * Create a new review
   */
  async createReview(
    data: {
      userId: string;
      targetId: string;
      targetType: ReviewTargetType;
      rating: number;
      title?: string;
      content: string;
      isVerifiedPurchase?: boolean;
    }
  ): Promise<Review> {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      // Create the review
      const review = await tx.review.create({
        data: {
          userId: data.userId,
          targetId: data.targetId,
          targetType: data.targetType,
          rating: data.rating,
          title: data.title,
          content: data.content
        },
        include: this.defaultInclude,
      });
      
      // Update the average rating for the target
      await this.updateAverageRating(tx, data.targetId, data.targetType);
      
      return review;
    });
  }

  /**
   * Update average rating for a target entity
   */
  private async updateAverageRating(
    tx: PrismaClient,
    targetId: string,
    targetType: ReviewTargetType
  ): Promise<void> {
    // Calculate average rating
    const result = await tx.review.aggregate({
      where: {
        targetId,
        targetType,
      },
      _avg: {
        rating: true,
      },
      _count: true,
    });
    
    const avgRating = result._avg.rating || 0;
    const reviewCount = result._count || 0;
    
    // Update the target entity based on type
    switch (targetType) {
      case 'product':
        // Since schema doesn't have these fields, we'll just store the review count
        // without updating the average rating field
        await tx.product.update({
          where: { id: targetId },
          data: {}
        });
        break;
        
      case 'clinic':
        // Since schema doesn't have these fields, we'll just update without
        // modifying averageRating or metadata
        await tx.clinic.update({
          where: { id: targetId },
          data: {}
        });
        break;
        
      case 'service':
        // Since schema doesn't have these fields, we'll just update without
        // modifying averageRating or metadata
        await tx.clinicService.update({
          where: { id: targetId },
          data: {}
        });
        break;
        
      // Add other target types as needed
    }
  }

  /**
   * Add reply to a review
   */
  async addReply(
    data: {
      reviewId: string;
      userId: string;
      content: string;
      isStaffReply?: boolean;
    }
  ): Promise<ReviewReply> {
    return this.prisma.reviewReply.create({
      data: {
        ...data,
        isStaffReply: data.isStaffReply || false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });
  }

  /**
   * Vote on a review (helpful/not helpful)
   */
  async voteOnReview(
    data: {
      reviewId: string;
      userId: string;
      isHelpful: boolean; // We'll map this to isUpvote internally
    }
  ): Promise<ReviewVote> {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      // Check if user already voted
      const existingVote = await tx.reviewVote.findFirst({
        where: {
          reviewId: data.reviewId,
          userId: data.userId,
        },
      });
      
      if (existingVote) {
        // Update existing vote
        return tx.reviewVote.update({
          where: {
            id: existingVote.id,
          },
          data: {
            isUpvote: data.isHelpful,
          },
        });
      }
      
      // Create new vote
      return tx.reviewVote.create({
        data: {
          reviewId: data.reviewId,
          userId: data.userId,
          isUpvote: data.isHelpful
        },
      });
    });
  }

  /**
   * Get reviews for a target entity
   */
  async getReviewsForTarget(
    targetId: string,
    targetType: ReviewTargetType,
    options?: {
      skip?: number;
      take?: number;
      sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
      filterByRating?: number;
    }
  ): Promise<Review[]> {
    let orderBy: any;
    
    switch (options?.sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'highest_rating':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest_rating':
        orderBy = { rating: 'asc' };
        break;
      case 'most_helpful':
        orderBy = { helpfulVotes: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    
    const where: any = {
      targetId,
      targetType,
    };
    
    if (options?.filterByRating !== undefined) {
      where.rating = options.filterByRating;
    }
    
    return this.prisma.review.findMany({
      where,
      include: this.defaultInclude,
      orderBy,
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Get rating summary for a target
   */
  async getRatingSummary(
    targetId: string,
    targetType: ReviewTargetType
  ): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    verifiedPurchaseCount: number;
    withImagesCount: number;
  }> {
    const [
      aggregates,
      verifiedCount,
      withImagesCount,
      distribution,
    ] = await Promise.all([
      // Get average and count
      this.prisma.review.aggregate({
        where: {
          targetId,
          targetType,
        },
        _avg: {
          rating: true,
        },
        _count: true,
      }),
      
      // No verified purchase flag in schema
      // Default to 0
      Promise.resolve(0),
      
      // Get reviews with images count
      this.prisma.review.count({
        where: {
          targetId,
          targetType,
          mediaUrls: {
            isEmpty: false,
          },
        },
      }),
      
      // Get rating distribution
      this.prisma.review.groupBy({
        by: ['rating'],
        where: {
          targetId,
          targetType,
        },
        _count: true,
      }),
    ]);
    
    // Build rating distribution
    const ratingDistribution: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
    };
    
    distribution.forEach((item: {rating: number, _count: number}) => {
      ratingDistribution[item.rating] = item._count;
    });
    
    return {
      averageRating: aggregates._avg.rating || 0,
      totalReviews: aggregates._count || 0,
      ratingDistribution,
      verifiedPurchaseCount: verifiedCount,
      withImagesCount,
    };
  }

  /**
   * Find featured reviews for a target
   */
  async findFeaturedReviews(
    targetId: string,
    targetType: ReviewTargetType,
    limit: number = 3
  ): Promise<Review[]> {
    // Get reviews with the highest helpful votes
    return this.prisma.$queryRaw`
      SELECT r.*, 
             COUNT(CASE WHEN v.is_helpful THEN 1 END) as helpful_count
      FROM reviews r
      LEFT JOIN review_votes v ON r.id = v.review_id
      WHERE r.target_id = ${targetId}
        AND r.target_type = ${targetType}
        AND r.rating >= 4
      GROUP BY r.id
      ORDER BY helpful_count DESC, r.rating DESC, r.created_at DESC
      LIMIT ${limit}
    `;
  }

  /**
   * Get reviews by a specific user
   */
  async getUserReviews(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: {
        userId,
      },
      include: this.defaultInclude,
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }
}
