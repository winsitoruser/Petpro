// Simple config wrapper for compatibility
export default {
  vendorService: {
    baseUrl: process.env.VENDOR_SERVICE_URL || 'http://localhost:3006',
  },
  paymentService: {
    baseUrl: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3007',
  },
  notificationService: {
    baseUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008',
  },
  database: {
    url: process.env.DATABASE_URL || `postgresql://${process.env.DB_USERNAME || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'petpro_booking_dev'}`,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
  },
};