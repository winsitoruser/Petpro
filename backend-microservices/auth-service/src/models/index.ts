// Re-export all models from their locations
export { User } from './user.model';
export { Pet } from './pet.model';
export { RefreshToken } from './refresh-token.model';

// Placeholder types for Express-style controller compatibility
export interface NotificationPreference {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  deviceId: string;
  platform: string;
}

export interface SavedVendor {
  id: string;
  userId: string;
  vendorId: string;
}