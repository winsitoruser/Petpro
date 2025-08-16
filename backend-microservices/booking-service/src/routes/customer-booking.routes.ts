import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as customerBookingController from '../controllers/customer-booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { customerOnly } from '../middleware/role.middleware';

const router = Router();

/**
 * Get customer bookings with filtering
 * @route GET /api/customer/bookings
 */
router.get(
  '/bookings',
  authenticate,
  customerOnly,
  [
    query('status').optional().isString(),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  customerBookingController.getBookings
);

/**
 * Get booking by ID
 * @route GET /api/customer/bookings/:id
 */
router.get(
  '/bookings/:id',
  authenticate,
  customerOnly,
  [
    param('id').isUUID(4)
  ],
  customerBookingController.getBookingById
);

/**
 * Create new booking
 * @route POST /api/customer/bookings
 */
router.post(
  '/bookings',
  authenticate,
  customerOnly,
  [
    body('vendorId').isUUID(4),
    body('serviceId').isUUID(4),
    body('petId').isUUID(4),
    body('date').isISO8601(),
    body('timeSlot').isString().notEmpty(),
    body('notes').optional().isString(),
    body('specialRequirements').optional().isString()
  ],
  customerBookingController.createBooking
);

/**
 * Cancel booking
 * @route POST /api/customer/bookings/:id/cancel
 */
router.post(
  '/bookings/:id/cancel',
  authenticate,
  customerOnly,
  [
    param('id').isUUID(4),
    body('reason').optional().isString()
  ],
  customerBookingController.cancelBooking
);

/**
 * Reschedule booking
 * @route PUT /api/customer/bookings/:id/reschedule
 */
router.put(
  '/bookings/:id/reschedule',
  authenticate,
  customerOnly,
  [
    param('id').isUUID(4),
    body('date').isISO8601(),
    body('timeSlot').isString().notEmpty()
  ],
  customerBookingController.rescheduleBooking
);

/**
 * Get available time slots
 * @route GET /api/customer/available-slots
 */
router.get(
  '/available-slots',
  authenticate,
  customerOnly,
  [
    query('vendorId').isUUID(4),
    query('serviceId').isUUID(4),
    query('date').isISO8601()
  ],
  customerBookingController.getAvailableTimeSlots
);

/**
 * Get booking status history
 * @route GET /api/customer/bookings/:id/status-history
 */
router.get(
  '/bookings/:id/status-history',
  authenticate,
  customerOnly,
  [
    param('id').isUUID(4)
  ],
  customerBookingController.getBookingStatusHistory
);

/**
 * Get booking statistics
 * @route GET /api/customer/booking-statistics
 */
router.get(
  '/booking-statistics',
  authenticate,
  customerOnly,
  customerBookingController.getBookingStatistics
);

export default router;
