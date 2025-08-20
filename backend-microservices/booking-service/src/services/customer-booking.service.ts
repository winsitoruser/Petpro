import { Booking, BookingStatus } from '../models/booking.model';
import { Service } from '../models/service.model';
import { Pet } from '../models/pet.model';
import { User } from '../models/user.model';
import { StatusHistory } from '../models/status-history.model';
import { TimeSlot } from '../models/time-slot.model';
import { VendorSchedule } from '../models/vendor-schedule.model';
import { Op } from 'sequelize';
import { format, parseISO, isValid } from 'date-fns';
import logger from '../utils/logger';
import axios from 'axios';
import config from '../config';

interface FilterOptions {
  status?: string;
  from?: string;
  to?: string;
  limit: number;
  offset: number;
}

/**
 * Get bookings for a specific customer with optional filters
 * @param userId Customer user ID
 * @param filterOptions Filter options (status, date range, pagination)
 * @returns List of bookings
 */
export const getCustomerBookings = async (userId: string, filterOptions: FilterOptions) => {
  try {
    const { status, from, to, limit, offset } = filterOptions;
    const whereClause: any = { customerId: userId };
    
    // Status filter
    if (status) {
      if (status === 'upcoming') {
        whereClause.status = {
          [Op.in]: ['confirmed', 'pending']
        };
        whereClause.date = {
          [Op.gte]: new Date()
        };
      } else if (status === 'active') {
        whereClause.status = {
          [Op.in]: ['in_progress']
        };
      } else if (status === 'completed') {
        whereClause.status = 'completed';
      } else if (status === 'cancelled') {
        whereClause.status = 'cancelled';
      } else if (status !== 'all') {
        whereClause.status = status;
      }
    }
    
    // Date range filter
    if (from && isValid(parseISO(from))) {
      if (!whereClause.date) whereClause.date = {};
      whereClause.date[Op.gte] = parseISO(from);
    }
    
    if (to && isValid(parseISO(to))) {
      if (!whereClause.date) whereClause.date = {};
      whereClause.date[Op.lte] = parseISO(to);
    }
    
    // Fetch bookings
    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [
        ['date', 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'description', 'price', 'duration', 'type']
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'profileImage', 'address', 'city', 'state']
        },
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name', 'species', 'breed', 'gender', 'birthdate']
        }
      ]
    });

    return {
      total: bookings.count,
      offset,
      limit,
      bookings: bookings.rows
    };
  } catch (error) {
    logger.error('Error in getCustomerBookings service', { error, userId });
    throw error;
  }
};

/**
 * Get a specific booking by ID for a customer
 * @param userId Customer user ID
 * @param bookingId Booking ID
 * @returns Booking details or null if not found
 */
export const getBookingById = async (userId: string, bookingId: string) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        customerId: userId
      },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'description', 'price', 'duration', 'type']
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'profileImage', 'address', 'city', 'state', 'phoneNumber', 'email']
        },
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'name', 'species', 'breed', 'gender', 'birthdate', 'imageUrl']
        },
        {
          model: StatusHistory,
          as: 'statusHistory',
          attributes: ['id', 'status', 'note', 'createdAt'],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    return booking;
  } catch (error) {
    logger.error('Error in getBookingById service', { error, userId, bookingId });
    throw error;
  }
};

/**
 * Create a new booking for a customer
 * @param userId Customer user ID
 * @param bookingData Booking data
 * @returns Created booking
 */
export const createBooking = async (userId: string, bookingData: any) => {
  try {
    // Validate service availability
    const service = await Service.findByPk(bookingData.serviceId);
    if (!service) {
      throw new Error('Service not available');
    }

    // Validate time slot availability
    const isTimeSlotAvailable = await checkTimeSlotAvailability(
      bookingData.vendorId,
      bookingData.serviceId,
      bookingData.date,
      bookingData.timeSlot
    );

    if (!isTimeSlotAvailable) {
      throw new Error('Time slot not available');
    }

    // Create booking
    const booking = await Booking.create({
      customerId: userId,
      vendorId: bookingData.vendorId,
      serviceId: bookingData.serviceId,
      petId: bookingData.petId,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      status: 'pending',
      totalPrice: service.price,
      notes: bookingData.notes || '',
      specialRequirements: bookingData.specialRequirements || ''
    });

    // Create initial status history
    await StatusHistory.create({
      bookingId: booking.id,
      status: 'pending',
      note: 'Booking created'
    });

    // Fetch complete booking with associations
    return getBookingById(userId, booking.id);
  } catch (error) {
    logger.error('Error in createBooking service', { error, userId });
    throw error;
  }
};

/**
 * Cancel a booking
 * @param userId Customer user ID
 * @param bookingId Booking ID to cancel
 * @param reason Cancellation reason
 * @returns Operation result
 */
export const cancelBooking = async (userId: string, bookingId: string, reason: string) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        customerId: userId
      }
    });

    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return { success: false, message: `Cannot cancel a ${booking.status} booking` };
    }

    // Check cancellation policy for time limits
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursDifference = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If less than 24 hours until booking, check vendor's cancellation policy
    if (hoursDifference < 24) {
      // This would typically involve checking the vendor's cancellation policy
      // For now, just log it
      logger.info('Late cancellation (< 24h) detected', { bookingId });
      // Could apply cancellation fees here
    }

    // Update booking status
    await booking.update({ status: 'cancelled' });

    // Add to status history
    await StatusHistory.create({
      bookingId: booking.id,
      status: 'cancelled',
      note: reason || 'Cancelled by customer'
    });

    // Get updated booking
    const updatedBooking = await getBookingById(userId, bookingId);

    return { success: true, booking: updatedBooking };
  } catch (error) {
    logger.error('Error in cancelBooking service', { error, userId, bookingId });
    throw error;
  }
};

/**
 * Reschedule a booking
 * @param userId Customer user ID
 * @param bookingId Booking ID to reschedule
 * @param date New date
 * @param timeSlot New time slot
 * @returns Operation result
 */
export const rescheduleBooking = async (userId: string, bookingId: string, date: string, timeSlot: string) => {
  try {
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        customerId: userId
      },
      include: [
        {
          model: Service,
          as: 'service'
        }
      ]
    });

    if (!booking) {
      return { success: false, message: 'Booking not found' };
    }

    // Check if booking can be rescheduled
    if (!['confirmed', 'pending'].includes(booking.status)) {
      return { success: false, message: `Cannot reschedule a ${booking.status} booking` };
    }

    // Check rescheduling policy for time limits
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursDifference = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If less than 24 hours until booking, check vendor's rescheduling policy
    if (hoursDifference < 24) {
      logger.info('Late rescheduling (< 24h) detected', { bookingId });
      // Could apply rescheduling fees here
    }

    // Validate new time slot availability
    const isTimeSlotAvailable = await checkTimeSlotAvailability(
      booking.vendorId,
      booking.serviceId,
      date,
      timeSlot
    );

    if (!isTimeSlotAvailable) {
      return { success: false, message: 'Selected time slot is not available' };
    }

    // Store old date/time for history
    const oldDate = format(new Date(booking.date), 'yyyy-MM-dd');
    const oldTimeSlot = booking.timeSlot;

    // Update booking
    await booking.update({ date, timeSlot });

    // Add to status history
    await StatusHistory.create({
      bookingId: booking.id,
      status: booking.status,
      note: `Rescheduled from ${oldDate} ${oldTimeSlot} to ${date} ${timeSlot}`
    });

    // Get updated booking
    const updatedBooking = await getBookingById(userId, bookingId);

    return { success: true, booking: updatedBooking };
  } catch (error) {
    logger.error('Error in rescheduleBooking service', { error, userId, bookingId });
    throw error;
  }
};

/**
 * Get available time slots for a service
 * @param vendorId Vendor ID
 * @param serviceId Service ID
 * @param date Date to check (YYYY-MM-DD)
 * @returns List of available time slots
 */
export const getAvailableTimeSlots = async (vendorId: string, serviceId: string, date: string) => {
  try {
    // Get service details for duration
    const service = await Service.findByPk(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const serviceDuration = service.duration;

    // Get vendor schedule for the day
    const dayOfWeek = new Date(date).getDay();
    const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];

    const vendorSchedule = await VendorSchedule.findOne({
      where: {
        vendorId,
        day: weekday
      }
    });

    if (!vendorSchedule || !vendorSchedule.isActive) {
      return { date, availableSlots: [] };
    }

    // Get all time slots
    const allSlots = await TimeSlot.findAll({
      where: {
        startTime: {
          [Op.between]: [vendorSchedule.startTime, vendorSchedule.endTime]
        }
      },
      order: [['startTime', 'ASC']]
    });

    // Get booked slots for the date and vendor
    const bookedSlots = await Booking.findAll({
      where: {
        vendorId,
        date,
        status: {
          [Op.notIn]: ['cancelled']
        }
      },
      attributes: ['timeSlot']
    });

    const bookedSlotValues = bookedSlots.map(booking => booking.timeSlot);
    
    // Filter available slots
    const availableSlots = allSlots.filter(slot => !bookedSlotValues.includes(slot.id));

    return {
      date,
      availableSlots: availableSlots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    };
  } catch (error) {
    logger.error('Error in getAvailableTimeSlots service', { error, vendorId, serviceId, date });
    throw error;
  }
};

/**
 * Check if a specific time slot is available
 * @param vendorId Vendor ID
 * @param serviceId Service ID
 * @param date Date (YYYY-MM-DD)
 * @param timeSlotId Time slot ID
 * @returns Boolean indicating availability
 */
const checkTimeSlotAvailability = async (
  vendorId: string,
  serviceId: string,
  date: string,
  timeSlotId: string
) => {
  try {
    const availabilityData = await getAvailableTimeSlots(vendorId, serviceId, date);
    const isAvailable = availabilityData.availableSlots.some(slot => slot.id === timeSlotId);
    return isAvailable;
  } catch (error) {
    logger.error('Error in checkTimeSlotAvailability service', { error, vendorId, serviceId, date, timeSlotId });
    throw error;
  }
};

/**
 * Get booking status history
 * @param userId Customer user ID
 * @param bookingId Booking ID
 * @returns Status history for the booking
 */
export const getBookingStatusHistory = async (userId: string, bookingId: string) => {
  try {
    // Check if booking belongs to customer
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        customerId: userId
      }
    });

    if (!booking) {
      return null;
    }

    // Get status history
    const statusHistory = await StatusHistory.findAll({
      where: { bookingId },
      order: [['createdAt', 'ASC']]
    });

    return {
      bookingId,
      currentStatus: booking.status,
      history: statusHistory
    };
  } catch (error) {
    logger.error('Error in getBookingStatusHistory service', { error, userId, bookingId });
    throw error;
  }
};

/**
 * Get booking statistics for a customer
 * @param userId Customer user ID
 * @returns Booking statistics
 */
export const getCustomerBookingStatistics = async (userId: string) => {
  try {
    // Total bookings count
    const totalBookings = await Booking.count({
      where: { customerId: userId }
    });

    // Count by status
    const pendingCount = await Booking.count({
      where: {
        customerId: userId,
        status: 'pending'
      }
    });

    const confirmedCount = await Booking.count({
      where: {
        customerId: userId,
        status: 'confirmed'
      }
    });

    const completedCount = await Booking.count({
      where: {
        customerId: userId,
        status: 'completed'
      }
    });

    const cancelledCount = await Booking.count({
      where: {
        customerId: userId,
        status: 'cancelled'
      }
    });

    const inProgressCount = await Booking.count({
      where: {
        customerId: userId,
        status: 'in_progress'
      }
    });

    // Upcoming bookings
    const upcomingCount = await Booking.count({
      where: {
        customerId: userId,
        status: {
          [Op.in]: ['confirmed', 'pending']
        },
        date: {
          [Op.gte]: new Date()
        }
      }
    });

    // Most booked service
    const services = await Booking.findAll({
      where: { customerId: userId },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'category']
        }
      ],
      attributes: ['serviceId'],
      group: ['serviceId', 'service.id', 'service.name', 'service.category']
    });

    // Group and count services
    const serviceCount = {};
    services.forEach(booking => {
      if (booking.service) {
        const serviceId = booking.service.id;
        if (serviceCount[serviceId]) {
          serviceCount[serviceId].count++;
        } else {
          serviceCount[serviceId] = {
            id: serviceId,
            name: booking.service.name,
            type: booking.service.category,
            count: 1
          };
        }
      }
    });

    // Sort by count and get the most frequent
    const mostBookedServices = Object.values(serviceCount)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 3);

    return {
      totalBookings,
      statusCounts: {
        pending: pendingCount,
        confirmed: confirmedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: cancelledCount,
        upcoming: upcomingCount
      },
      mostBookedServices
    };
  } catch (error) {
    logger.error('Error in getCustomerBookingStatistics service', { error, userId });
    throw error;
  }
};
