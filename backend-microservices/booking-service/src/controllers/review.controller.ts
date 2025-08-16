import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import * as reviewService from '../services/review.service';
import logger from '../utils/logger';
import i18n from '../i18n';

/**
 * Create a new review for a completed booking
 */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const { bookingId, rating, review, anonymous } = req.body;
    
    const result = await reviewService.createReview(
      userId,
      bookingId,
      rating,
      review,
      anonymous || false
    );

    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
      return;
    }

    res.status(StatusCodes.CREATED).json(result.review);
  } catch (error) {
    logger.error('Error creating review', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Update an existing review
 */
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const reviewId = req.params.id;
    const { rating, review, anonymous } = req.body;

    const result = await reviewService.updateReview(
      userId,
      reviewId,
      rating,
      review,
      anonymous
    );

    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
      return;
    }

    res.status(StatusCodes.OK).json(result.review);
  } catch (error) {
    logger.error('Error updating review', { error, userId: req.user?.id, reviewId: req.params.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const reviewId = req.params.id;
    const result = await reviewService.deleteReview(userId, reviewId);

    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
      return;
    }

    res.status(StatusCodes.OK).json({ message: i18n.__('review.deleted') });
  } catch (error) {
    logger.error('Error deleting review', { error, userId: req.user?.id, reviewId: req.params.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get all reviews for a vendor
 */
export const getVendorReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = req.params.vendorId;
    const { sort, filter, limit, offset } = req.query;
    
    const filterOptions = {
      sort: sort as string || 'recent',
      filter: filter as string || 'all',
      limit: limit ? parseInt(limit as string, 10) : 10,
      offset: offset ? parseInt(offset as string, 10) : 0
    };

    const reviews = await reviewService.getVendorReviews(vendorId, filterOptions);
    res.status(StatusCodes.OK).json(reviews);
  } catch (error) {
    logger.error('Error getting vendor reviews', { error, vendorId: req.params.vendorId });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get review summary for a vendor
 */
export const getVendorReviewSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = req.params.vendorId;
    const summary = await reviewService.getVendorReviewSummary(vendorId);
    res.status(StatusCodes.OK).json(summary);
  } catch (error) {
    logger.error('Error getting vendor review summary', { error, vendorId: req.params.vendorId });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Mark a review as helpful
 */
export const markReviewHelpful = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const reviewId = req.params.id;
    const result = await reviewService.markReviewHelpful(userId, reviewId);

    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
      return;
    }

    res.status(StatusCodes.OK).json({ message: i18n.__('review.markedHelpful'), helpfulCount: result.helpfulCount });
  } catch (error) {
    logger.error('Error marking review as helpful', { error, userId: req.user?.id, reviewId: req.params.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get customer's own reviews
 */
export const getCustomerReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const { limit, offset } = req.query;
    const filterOptions = {
      limit: limit ? parseInt(limit as string, 10) : 10,
      offset: offset ? parseInt(offset as string, 10) : 0
    };

    const reviews = await reviewService.getCustomerReviews(userId, filterOptions);
    res.status(StatusCodes.OK).json(reviews);
  } catch (error) {
    logger.error('Error getting customer reviews', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get review by ID
 */
export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviewId = req.params.id;
    const review = await reviewService.getReviewById(reviewId);

    if (!review) {
      res.status(StatusCodes.NOT_FOUND).json({ message: i18n.__('review.notFound') });
      return;
    }

    res.status(StatusCodes.OK).json(review);
  } catch (error) {
    logger.error('Error getting review by ID', { error, reviewId: req.params.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get reviews for a specific booking
 */
export const getBookingReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.bookingId;
    const reviews = await reviewService.getBookingReviews(bookingId);
    res.status(StatusCodes.OK).json(reviews);
  } catch (error) {
    logger.error('Error getting booking reviews', { error, bookingId: req.params.bookingId });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};
