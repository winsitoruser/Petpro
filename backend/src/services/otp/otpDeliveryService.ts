/**
 * OTP Delivery Service
 * 
 * Handles delivery of OTP codes via different channels (SMS, Email, etc.)
 * Provides a unified interface for multiple delivery providers
 */

import { OtpDeliveryMethod, OtpType } from '../../types/otp';
import logger from '../../utils/logger';
import { metricsService } from '../monitoring/metricsService';
import { sendEmail } from '../email/emailService';
import { sendSMS } from '../sms/smsService';
import { eventEmitter } from '../../utils/eventEmitter';

interface DeliveryOptions {
  otpId: string;
  otp: string;
  type: OtpType;
  expiresAt: Date;
  userId?: string;
  recipientName?: string;
  language?: string;
}

export class OTPDeliveryService {
  private emailEnabled: boolean;
  private smsEnabled: boolean;
  private emailFrom: string;
  private emailFromName: string;
  private appName: string;
  
  constructor() {
    // Initialize from environment variables
    this.emailEnabled = process.env.EMAIL_ENABLED === 'true';
    this.smsEnabled = process.env.SMS_ENABLED === 'true';
    this.emailFrom = process.env.EMAIL_FROM || 'noreply@petpro.com';
    this.emailFromName = process.env.EMAIL_FROM_NAME || 'PetPro';
    this.appName = process.env.APP_NAME || 'PetPro';
    
    // Register metrics
    metricsService.registerCounter('otp_delivery_total', 'Total OTP delivery attempts', ['method', 'success']);
    metricsService.registerHistogram('otp_delivery_duration', 'OTP delivery duration in milliseconds', ['method']);
  }
  
  /**
   * Deliver OTP using the specified method
   */
  async deliverOTP(
    deliveryTarget: string, 
    deliveryMethod: OtpDeliveryMethod,
    options: DeliveryOptions
  ): Promise<boolean> {
    const startTime = Date.now();
    let success = false;
    
    logger.info('Attempting OTP delivery', { 
      method: deliveryMethod, 
      otpId: options.otpId,
      type: options.type 
    });
    
    try {
      switch(deliveryMethod) {
        case OtpDeliveryMethod.EMAIL:
          success = await this.deliverByEmail(deliveryTarget, options);
          break;
        case OtpDeliveryMethod.SMS:
          success = await this.deliverBySMS(deliveryTarget, options);
          break;
        default:
          logger.error('Unsupported OTP delivery method', { method: deliveryMethod });
          success = false;
      }
      
      // Track metrics
      const duration = Date.now() - startTime;
      metricsService.observeHistogram('otp_delivery_duration', duration, { method: deliveryMethod });
      metricsService.incrementCounter('otp_delivery_total', { 
        method: deliveryMethod,
        success: success.toString()
      });
      
      // Emit event
      eventEmitter.emit('otp:delivered', {
        success,
        method: deliveryMethod,
        otpId: options.otpId,
        userId: options.userId,
        deliveryTarget,
        duration
      });
      
      return success;
    } catch (error: any) {
      logger.error('OTP delivery failed', { 
        method: deliveryMethod, 
        error: error.message,
        otpId: options.otpId
      });
      
      metricsService.incrementCounter('otp_delivery_total', { 
        method: deliveryMethod,
        success: 'false'
      });
      
      return false;
    }
  }
  
  /**
   * Deliver OTP via Email
   */
  private async deliverByEmail(email: string, options: DeliveryOptions): Promise<boolean> {
    if (!this.emailEnabled) {
      logger.warn('Email delivery is disabled');
      return false;
    }
    
    // Format expiry time for readability
    const expiryMinutes = Math.round((options.expiresAt.getTime() - Date.now()) / 60000);
    
    // Select email template based on OTP type
    let template = 'otp-generic';
    let subject = `Your ${this.appName} Verification Code`;
    
    switch(options.type) {
      case OtpType.REGISTRATION:
        template = 'otp-registration';
        subject = `Verify Your ${this.appName} Account`;
        break;
      case OtpType.PASSWORD_RESET:
        template = 'otp-password-reset';
        subject = `Reset Your ${this.appName} Password`;
        break;
      case OtpType.LOGIN:
        template = 'otp-login';
        subject = `${this.appName} Login Verification`;
        break;
    }
    
    try {
      // Send email with OTP
      const result = await sendEmail({
        to: email,
        subject,
        template,
        context: {
          otp: options.otp,
          otpExpiry: expiryMinutes,
          name: options.recipientName || email,
          appName: this.appName,
          year: new Date().getFullYear()
        }
      });
      
      return result;
    } catch (error: any) {
      logger.error('Failed to send OTP email', { error: error.message });
      return false;
    }
  }
  
  /**
   * Deliver OTP via SMS
   */
  private async deliverBySMS(phoneNumber: string, options: DeliveryOptions): Promise<boolean> {
    if (!this.smsEnabled) {
      logger.warn('SMS delivery is disabled');
      return false;
    }
    
    // Format message based on OTP type
    let message = `Your ${this.appName} verification code is: ${options.otp}`;
    
    switch(options.type) {
      case OtpType.REGISTRATION:
        message = `Welcome to ${this.appName}! Your verification code is: ${options.otp}`;
        break;
      case OtpType.PASSWORD_RESET:
        message = `${this.appName} password reset code: ${options.otp}`;
        break;
      case OtpType.LOGIN:
        message = `${this.appName} login code: ${options.otp}`;
        break;
    }
    
    // Add expiry info
    const expiryMinutes = Math.round((options.expiresAt.getTime() - Date.now()) / 60000);
    message += ` (Valid for ${expiryMinutes} min)`;
    
    try {
      // Send SMS with OTP
      const result = await sendSMS({
        to: phoneNumber,
        message
      });
      
      return result.success;
    } catch (error: any) {
      logger.error('Failed to send OTP SMS', { error: error.message });
      return false;
    }
  }
}

// Export default instance
export const otpDeliveryService = new OTPDeliveryService();
export default otpDeliveryService;
