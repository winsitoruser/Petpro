/**
 * OTP Controller
 * 
 * Handles API endpoints for OTP generation, verification, and management.
 */
import { Request, Response } from 'express';
import { otpService } from '../services/otp/otpService';
import { otpDeliveryService } from '../services/otp/otpDeliveryService';
import { OtpDeliveryMethod, OtpType } from '../types/otp';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';
import AuthService from '../services/db/authService';
import UserService from '../services/db/userService';

// Create instances of the services
const authService = new AuthService();
const userService = new UserService();

export class OTPController {
  /**
   * Generate OTP for a specific purpose and send it
   */
  public async generateOTP(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { type, deliveryMethod, deliveryTarget } = req.body;
    
    try {
      // Check if user exists when type is not registration
      if (type !== OtpType.REGISTRATION && deliveryMethod === OtpDeliveryMethod.EMAIL) {
        const user = await userService.findByEmail(deliveryTarget);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
      }
      
      // Additional validation for email format if email delivery
      if (deliveryMethod === OtpDeliveryMethod.EMAIL && !this.isValidEmail(deliveryTarget)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      // Additional validation for phone format if SMS delivery
      if (deliveryMethod === OtpDeliveryMethod.SMS && !this.isValidPhone(deliveryTarget)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }
      
      // Get user ID if available
      let userId = undefined;
      if (req.user) {
        userId = req.user.id;
      } else if (type !== OtpType.REGISTRATION && deliveryMethod === OtpDeliveryMethod.EMAIL) {
        const user = await userService.findByEmail(deliveryTarget);
        userId = user?.id;
      }
      
      // Generate OTP
      const otpData = await otpService.generateOTP(
        type,
        deliveryTarget,
        deliveryMethod,
        userId
      );
      
      // Deliver OTP
      const deliverySuccess = await otpDeliveryService.deliverOTP(
        deliveryTarget,
        deliveryMethod,
        {
          otpId: otpData.otpId,
          otp: otpData.otp,
          type,
          expiresAt: otpData.expiresAt,
          userId
        }
      );
      
      if (!deliverySuccess) {
        // Invalidate OTP if delivery failed
        await otpService.invalidateOTP(otpData.otpId);
        return res.status(500).json({ message: `Failed to deliver OTP via ${deliveryMethod}` });
      }
      
      // Log security event
      if (userId) {
        await authService.recordSecurityEvent({
          userId,
          eventType: 'OTP_GENERATED',
          description: 'OTP generated and sent',
          metadata: {
          type,
          deliveryMethod,
          otpId: otpData.otpId
        });
      }
      
      // Return OTP ID (but never the OTP itself)
      return res.status(200).json({
        message: `OTP sent successfully via ${deliveryMethod}`,
        otpId: otpData.otpId,
        expiresAt: otpData.expiresAt
      });
    } catch (error: any) {
      logger.error('Error generating OTP', {
        error: error.message,
        type,
        deliveryMethod
      });
      
      if (error.message.includes('rate limited')) {
        return res.status(429).json({
          message: 'Too many OTP requests. Please try again later.',
          retryAfter: 60 // seconds
        });
      }
      
      return res.status(500).json({ message: 'Failed to generate OTP' });
    }
  }
  
  /**
   * Verify an OTP
   */
  public async verifyOTP(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { otpId, otpCode } = req.body;
    
    try {
      const verificationResult = await otpService.verifyOTP(otpId, otpCode);
      
      if (!verificationResult.success) {
        return res.status(400).json({ 
          message: verificationResult.message || 'Invalid or expired OTP'
        });
      }
      
      // Record security event if we have a user ID
      if (verificationResult.userId) {
        await authService.recordSecurityEvent({
          userId: verificationResult.userId,
          eventType: 'OTP_VERIFIED',
          description: 'OTP verified successfully',
          metadata: {
          type: verificationResult.type,
          otpId
        });
      }
      
      // Handle specific OTP types
      if (verificationResult.type === OtpType.REGISTRATION && verificationResult.userId) {
        // Activate the user account if this was a registration OTP
        await userService.update(verificationResult.userId, {
          emailVerified: true,
          status: 'ACTIVE'
        });
      }
      
      return res.status(200).json({
        message: 'OTP verified successfully',
        type: verificationResult.type
      });
    } catch (error: any) {
      logger.error('Error verifying OTP', {
        error: error.message,
        otpId
      });
      
      return res.status(500).json({ message: 'Failed to verify OTP' });
    }
  }
  
  /**
   * Resend an OTP (invalidates old one and generates new)
   */
  public async resendOTP(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { otpId } = req.body;
    
    try {
      // Get old OTP details from database
      const otpRecord = await otpService.getOtpRecord(otpId);
      
      if (!otpRecord) {
        return res.status(404).json({ message: 'OTP not found' });
      }
      
      if (otpRecord.status !== 'ACTIVE') {
        return res.status(404).json({ message: 'OTP not found or already used' });
      }
      
      // Invalidate old OTP
      await otpService.invalidateOTP(otpId);
      
      // Generate new OTP
      const otpData = await otpService.generateOTP(
        otpRecord.type as OtpType,
        otpRecord.deliveryTarget,
        otpRecord.deliveryMethod as OtpDeliveryMethod,
        otpRecord.userId
      );
      
      // Deliver OTP
      const deliverySuccess = await otpDeliveryService.deliverOTP(
        otpRecord.deliveryTarget,
        otpRecord.deliveryMethod as OtpDeliveryMethod,
        {
          otpId: otpData.otpId,
          otp: otpData.otp,
          type: otpRecord.type as OtpType,
          expiresAt: otpData.expiresAt,
          userId: otpRecord.userId
        }
      );
      
      if (!deliverySuccess) {
        // Invalidate OTP if delivery failed
        await otpService.invalidateOTP(otpData.otpId);
        return res.status(500).json({ 
          message: `Failed to deliver OTP via ${otpRecord.deliveryMethod}`
        });
      }
      
      // Log security event
      if (otpRecord.userId) {
        await authService.recordSecurityEvent({
          userId: otpRecord.userId,
          eventType: 'OTP_RESENT',
          description: 'OTP resent after invalidating previous code',
          metadata: {
          type: otpRecord.type,
          deliveryMethod: otpRecord.deliveryMethod,
          otpId: otpData.otpId
        });
      }
      
      // Return new OTP ID (but never the OTP itself)
      return res.status(200).json({
        message: `New OTP sent successfully via ${otpRecord.deliveryMethod}`,
        otpId: otpData.otpId,
        expiresAt: otpData.expiresAt
      });
    } catch (error: any) {
      logger.error('Error resending OTP', {
        error: error.message,
        otpId
      });
      
      if (error.message.includes('rate limited')) {
        return res.status(429).json({
          message: 'Too many OTP requests. Please try again later.',
          retryAfter: 60 // seconds
        });
      }
      
      return res.status(500).json({ message: 'Failed to resend OTP' });
    }
  }
  
  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate phone number format
   */
  private isValidPhone(phone: string): boolean {
    // Basic validation for international phone format
    // For production, consider using a proper phone validation library
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
  }
}

export const otpController = new OTPController();
