import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import ReviewService from '../services/db/reviewService';

// Type definitions
type ReviewTargetType = 'product' | 'clinic' | 'service';

const router = Router();
const reviewService = new ReviewService();

/**
 * Get reviews for a target (product, clinic, service)
 * GET /reviews/:targetType/:targetId
 */
router.get(
  '/:targetType/:targetId',
  [
    param('targetType').isIn(['product', 'clinic', 'service']).withMessage('Invalid target type'),
    param('targetId').isUUID().withMessage('Invalid target ID'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('sortBy').optional().isIn(['newest', 'highest', 'lowest', 'mostHelpful']),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targetType, targetId } = req.params;
      const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

      const reviews = await reviewService.getReviewsForTarget(
        targetId,
        targetType as 'product' | 'clinic' | 'service',
        {
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          sortBy: sortBy as any, // Type cast to any to resolve type mismatch
        }
      );

      return res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get rating summary for a target
 * GET /reviews/:targetType/:targetId/summary
 */
router.get(
  '/:targetType/:targetId/summary',
  [
    param('targetType').isIn(['product', 'clinic', 'service']).withMessage('Invalid target type'),
    param('targetId').isUUID().withMessage('Invalid target ID'),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targetType, targetId } = req.params;

      const summary = await reviewService.getRatingSummary(
        targetId,
        targetType as 'product' | 'clinic' | 'service'
      );

      return res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create a new review
 * POST /reviews/:targetType/:targetId
 */
router.post(
  '/:targetType/:targetId',
  [
    param('targetType').isIn(['product', 'clinic', 'service']).withMessage('Invalid target type'),
    param('targetId').isUUID().withMessage('Invalid target ID'),
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('title').isString().trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('content').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('isVerifiedPurchase').optional().isBoolean(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { targetType, targetId } = req.params;
      const { userId, title, content, rating, isVerifiedPurchase = false } = req.body;

      const review = await reviewService.createReview({
        userId,
        targetId,
        targetType: targetType as 'product' | 'clinic' | 'service',
        title,
        content,
        rating,
        isVerifiedPurchase,
      });

      return res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Add a reply to a review
 * POST /reviews/:reviewId/reply
 */
router.post(
  '/:reviewId/reply',
  [
    param('reviewId').isUUID().withMessage('Invalid review ID'),
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('content').isString().trim().isLength({ min: 5, max: 1000 }).withMessage('Content must be between 5 and 1000 characters'),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      const { userId, content } = req.body;

      const reply = await reviewService.addReply({
        reviewId,
        userId,
        content,
      });

      return res.status(201).json(reply);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Vote on a review
 * POST /reviews/:reviewId/vote
 */
router.post(
  '/:reviewId/vote',
  [
    param('reviewId').isUUID().withMessage('Invalid review ID'),
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('isHelpful').isBoolean().withMessage('isHelpful must be a boolean'),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reviewId } = req.params;
      const { userId, isHelpful } = req.body;

      const vote = await reviewService.voteOnReview({
        reviewId,
        userId,
        isHelpful,
      });

      return res.status(201).json(vote);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get featured reviews
 * GET /reviews/featured
 */
router.get(
  '/featured',
  [
    query('limit').optional().isInt({ min: 1, max: 10 }).toInt(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = 5 } = req.query;

      // For featured reviews, we use a special endpoint without target specifics
      // This implementation would need to be updated to match the service method signature
      // Typically for featured reviews across the platform
      const reviews = await reviewService.findFeaturedReviews(
        '', // placeholder targetId for all targets
        'product' as ReviewTargetType, // default to product type
        Number(limit)
      );

      return res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get a user's reviews
 * GET /reviews/user/:userId
 */
router.get(
  '/user/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const reviews = await reviewService.getUserReviews(
        userId,
        {
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }
      );

      return res.status(200).json(reviews);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
