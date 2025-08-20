/// <reference path="../types/express.d.ts" />
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import * as customerBookingService from '../services/customer-booking.service';
import logger from '../utils/logger';
import i18n from '../i18n';

/**
 * Get customer bookings with filtering options
 */
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    // Extract filter parameters from query string
    const { status, from, to, limit, offset } = req.query;
    const filterOptions = {
      status: status as string,
      from: from as string,
      to: to as string,
      limit: limit ? parseInt(limit as string, 10) : 10,
      offset: offset ? parseInt(offset as string, 10) : 0
    };

    const bookings = await customerBookingService.getCustomerBookings(userId, filterOptions);
    res.status(StatusCodes.OK).json(bookings);
  } catch (error) {
    logger.error('Error getting customer bookings', { error, userId: (req.user as any)?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get a specific booking by ID
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const bookingId = req.params.id;
    const booking = await customerBookingService.getBookingById(userId, bookingId);

    if (!booking) {
      res.status(StatusCodes.NOT_FOUND).json({ message: i18n.__('booking.notFound') });
      return;
    }

    res.status(StatusCodes.OK).json(booking);
  } catch (error) {
    logger.error('Error getting booking by ID', { error, userId: (req.user as any)?.id, bookingId: req.params.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      return;
    }

    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const bookingData = req.body;
    const newBooking = await customerBookingService.createBooking(userId, bookingData);

    res.status(StatusCodes.CREATED).json(newBooking);
  } catch (error) {
    logger.error('Error creating booking', { error, userId: (req.user as any)?.id });
    
    if (error.message === 'Service not available' || error.message === 'Time slot not available') {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
      return;
    }
    
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const bookingId = req.params.id;
    const reason = req.body.reason || 'Customer cancelled';

    const result = await customerBookingService.cancelBooking(userId, bookingId, reason);

    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
      return;
    }

    res.status(StatusCodes.OK).json({ message: i18n.__('booking.cancelled'), booking: result.booking });
  } catch (error) {
    logger.error('Error cancelling booking', { error, userId: (req.user as any)?.id, bookingId: req.params.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Reschedule a booking
 */
export const rescheduleBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      return;
    }

    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const bookingId = req.params.id;
    const { date, timeSlot } = req.body;

    const result = await customerBookingService.rescheduleBooking(userId, bookingId, date, timeSlot);

    if (!result.success) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: result.message });
      return;
    }

    res.status(StatusCodes.OK).json({ message: i18n.__('booking.rescheduled'), booking: result.booking });
  } catch (error) {
    logger.error('Error rescheduling booking', { error, userId: (req.user as any)?.id, bookingId: req.params.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get available time slots for a service
 */
export const getAvailableTimeSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vendorId, serviceId, date } = req.query;
    
    if (!vendorId || !serviceId || !date) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: i18n.__('booking.missingSlotParams') });
      return;
    }

    const timeSlots = await customerBookingService.getAvailableTimeSlots(
      vendorId as string,
      serviceId as string,
      date as string
    );

    res.status(StatusCodes.OK).json(timeSlots);
  } catch (error) {
    logger.error('Error getting available time slots', { error, query: req.query });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get booking status history
 */
export const getBookingStatusHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const bookingId = req.params.id;
    const statusHistory = await customerBookingService.getBookingStatusHistory(userId, bookingId);

    if (!statusHistory) {
      res.status(StatusCodes.NOT_FOUND).json({ message: i18n.__('booking.notFound') });
      return;
    }

    res.status(StatusCodes.OK).json(statusHistory);
  } catch (error) {
    logger.error('Error getting booking status history', { error, userId: (req.user as any)?.id, bookingId: req.params.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get customer booking statistics
 */
export const getBookingStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const statistics = await customerBookingService.getCustomerBookingStatistics(userId);
    res.status(StatusCodes.OK).json(statistics);
  } catch (error) {
    logger.error('Error getting booking statistics', { error, userId: (req.user as any)?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};
