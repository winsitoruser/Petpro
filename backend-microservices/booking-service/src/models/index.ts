// Re-export all models for compatibility
// Note: These would normally come from actual model files

// Placeholder exports for Express-style controller compatibility
export interface Booking {
  id: string;
  customerId: string;
  vendorId: string;
  serviceId: string;
  petId: string;
  timeSlotId: string;
  status: string;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

export interface TimeSlot {
  id: string;
  vendorScheduleId: string;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
}

export interface VendorSchedule {
  id: string;
  vendorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BookingStatus {
  id: string;
  bookingId: string;
  status: string;
  notes?: string;
  createdAt: Date;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: string;
  breed?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface StatusHistory {
  id: string;
  bookingId: string;
  status: string;
  notes?: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  vendorId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ReviewHelpful {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
}