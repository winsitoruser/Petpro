// API URLs for different environments
// In a production app, these would be injected via environment variables

export const API_URL = 'http://localhost:3001'; // Default API URL for development
export const SOCKET_URL = 'http://localhost:3001'; // Default Socket.IO URL 

// Socket namespaces
export const SOCKET_BOOKING_EVENTS = '/booking-events';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },
  BOOKINGS: {
    LIST: '/bookings',
    DETAILS: (id: string) => `/bookings/${id}`,
    CREATE: '/bookings',
    UPDATE: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
  PETS: {
    LIST: '/pets',
    DETAILS: (id: string) => `/pets/${id}`,
    CREATE: '/pets',
    UPDATE: (id: string) => `/pets/${id}`,
    DELETE: (id: string) => `/pets/${id}`,
  },
  VENDORS: {
    LIST: '/vendors',
    DETAILS: (id: string) => `/vendors/${id}`,
    SERVICES: (id: string) => `/vendors/${id}/services`,
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
};
