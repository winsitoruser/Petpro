import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { customerOnly } from '../middleware/role.middleware';

const router = Router();

/**
 * Create a new review
 * @route POST /api/reviews
 */
router.post(
  '/',
  authenticate,
  customerOnly,
  [
    body('bookingId').isUUID(4),
    body('rating').isInt({ min: 1, max: 5 }),
    body('review').isString().trim().notEmpty().isLength({ max: 2000 }),
    body('anonymous').optional().isBoolean()
  ],
  reviewController.createReview
);

/**
 * Update an existing review
 * @route PUT /api/reviews/:id
 */
router.put(
  '/:id',
  authenticate,
  customerOnly,
  [
    param('id').isUUID(4),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('review').optional().isString().trim().notEmpty().isLength({ max: 2000 }),
    body('anonymous').optional().isBoolean()
  ],
  reviewController.updateReview
);

/**
 * Delete a review
 * @route DELETE /api/reviews/:id
 */
router.delete(
  '/:id',
  authenticate,
  customerOnly,
  [
    param('id').isUUID(4)
  ],
  reviewController.deleteReview
);

/**
 * Get reviews for a vendor
 * @route GET /api/reviews/vendor/:vendorId
 */
router.get(
  '/vendor/:vendorId',
  [
    param('vendorId').isUUID(4),
    query('sort').optional().isIn(['recent', 'helpful', 'rating_high', 'rating_low']),
    query('filter').optional().isIn(['all', 'positive', 'negative', 'neutral']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  reviewController.getVendorReviews
);

/**
 * Get review summary for a vendor
 * @route GET /api/reviews/vendor/:vendorId/summary
 */
router.get(
  '/vendor/:vendorId/summary',
  [
    param('vendorId').isUUID(4)
  ],
  reviewController.getVendorReviewSummary
);

/**
 * Mark a review as helpful
 * @route POST /api/reviews/:id/helpful
 */
router.post(
  '/:id/helpful',
  authenticate,
  [
    param('id').isUUID(4)
  ],
  reviewController.markReviewHelpful
);

/**
 * Get customer's own reviews
 * @route GET /api/reviews/my-reviews
 */
router.get(
  '/my-reviews',
  authenticate,
  customerOnly,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  reviewController.getCustomerReviews
);

/**
 * Get review by ID
 * @route GET /api/reviews/:id
 */
router.get(
  '/:id',
  [
    param('id').isUUID(4)
  ],
  reviewController.getReviewById
);

/**
 * Get reviews for a booking
 * @route GET /api/reviews/booking/:bookingId
 */
router.get(
  '/booking/:bookingId',
  [
    param('bookingId').isUUID(4)
  ],
  reviewController.getBookingReviews
);

export default router;
