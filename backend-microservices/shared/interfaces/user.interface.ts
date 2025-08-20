/**
 * Shared User Interface for Inter-Service Communication
 * Used by all services to maintain consistent user data structure
 */
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  isEmailVerified?: boolean;
  profileImage?: string;
  businessName?: string;
  averageRating?: number;
  totalReviews?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Minimal user data for references
 */
export interface IUserReference {
  id: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'vendor' | 'admin';
}

/**
 * User creation data
 */
export interface ICreateUser {
  firstName: string;
  lastName: string;  
  email: string;
  password: string;
  role: 'customer' | 'vendor' | 'admin';
  profileImage?: string;
  businessName?: string;
}

/**
 * User update data
 */
export interface IUpdateUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string;
  businessName?: string;
  isEmailVerified?: boolean;
  active?: boolean;
}