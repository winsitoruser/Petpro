// Simple i18n placeholder for compatibility
export default {
  __: (key: string) => {
    const messages: Record<string, string> = {
      'auth.unauthorized': 'Unauthorized access',
      'booking.notFound': 'Booking not found',
      'booking.alreadyCancelled': 'Booking already cancelled',
      'booking.cannotCancel': 'Cannot cancel booking',
      'booking.invalidTimeSlot': 'Invalid time slot',
      'booking.serviceNotAvailable': 'Service not available',
      'common.serverError': 'Internal server error',
      'validation.required': 'This field is required',
      'review.notFound': 'Review not found',
      'review.alreadyExists': 'Review already exists',
    };
    return messages[key] || key;
  }
};