/**
 * OTP Type Definitions
 * 
 * Contains enums and interfaces for OTP operations
 */

/**
 * Types of OTP use cases
 */
export enum OtpType {
  REGISTRATION = 'REGISTRATION',           // For new account verification
  LOGIN = 'LOGIN',                         // For two-factor authentication
  PASSWORD_RESET = 'PASSWORD_RESET',       // For password reset flow
  EMAIL_CHANGE = 'EMAIL_CHANGE',           // For email address change verification
  PHONE_CHANGE = 'PHONE_CHANGE',           // For phone number change verification
  TRANSACTION = 'TRANSACTION',             // For transaction verification
  ACCOUNT_RECOVERY = 'ACCOUNT_RECOVERY'    // For account recovery process
}

/**
 * OTP delivery methods
 */
export enum OtpDeliveryMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH'    // For future use with mobile app notifications
}

/**
 * OTP status options
 */
export enum OtpStatus {
  ACTIVE = 'ACTIVE',         // OTP is active and can be verified
  USED = 'USED',             // OTP has been successfully used
  EXPIRED = 'EXPIRED',       // OTP has expired
  CANCELLED = 'CANCELLED'    // OTP has been cancelled by user or admin
}

/**
 * OTP verification result
 */
export interface OtpVerificationResult {
  success: boolean;
  message?: string;
  userId?: string;
  type?: OtpType;
  metadata?: any;
}

/**
 * OTP generation options
 */
export interface OtpGenerationOptions {
  userId?: string;           // Optional user ID
  expiresInSeconds?: number; // Custom expiration time
  metadata?: any;            // Additional data to store with OTP
}

/**
 * OTP delivery result
 */
export interface OtpDeliveryResult {
  success: boolean;
  message?: string;
  provider?: string;
  deliveryId?: string;
}
