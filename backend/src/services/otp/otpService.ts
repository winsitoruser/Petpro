/**
 * OTP (One-Time Password) Service
 * 
 * Handles OTP generation, validation, storage, and expiration for authentication purposes.
 * Supports both email and SMS delivery methods with configurable settings.
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import BaseService from '../db/baseService';
import { OtpType, OtpDeliveryMethod, OtpStatus } from '../../types/otp';
import { Prisma } from '@prisma/client';
import logger from '../../utils/logger';
import { metricsService } from '../monitoring/metricsService';
import { eventEmitter } from '../../utils/eventEmitter';

export class OTPService extends BaseService<any> {
  private readonly otpLength: number;
  private readonly otpExpiry: number; // in seconds
  private readonly maxAttempts: number;
  private readonly cooldownPeriod: number; // in seconds
  private readonly alphanumeric: boolean;
  
  constructor(options?: {
    otpLength?: number;
    otpExpiry?: number;
    maxAttempts?: number;
    cooldownPeriod?: number;
    alphanumeric?: boolean;
  }) {
    super('otp');
    
    // Default configurations - can be overridden
    this.otpLength = options?.otpLength || 6;
    this.otpExpiry = options?.otpExpiry || 300; // 5 minutes
    this.maxAttempts = options?.maxAttempts || 3;
    this.cooldownPeriod = options?.cooldownPeriod || 60; // 1 minute
    this.alphanumeric = options?.alphanumeric || false; // Default to numeric OTP
    
    // Register metrics
    metricsService.registerCounter('otp_generated_total', 'Total OTPs generated', ['type', 'delivery_method']);
    metricsService.registerCounter('otp_verified_total', 'Total OTPs verified', ['type', 'success']);
    metricsService.registerCounter('otp_expired_total', 'Total OTPs expired');
    metricsService.registerCounter('otp_rate_limited_total', 'Total OTP requests rate limited', ['delivery_target']);
    metricsService.registerGauge('otp_active_total', 'Total active OTPs');
  }
  
  /**
   * Generate a new OTP
   * @param type Type of OTP (e.g. REGISTRATION, PASSWORD_RESET)
   * @param userId Optional user ID if available
   * @param deliveryTarget Email or phone number to deliver the OTP to
   * @param deliveryMethod Method to deliver OTP (EMAIL or SMS)
   */
  async generateOTP(
    type: OtpType,
    deliveryTarget: string,
    deliveryMethod: OtpDeliveryMethod,
    userId?: string
  ): Promise<{
    otpId: string;
    otp: string;
    expiresAt: Date;
  }> {
    // Check rate limiting first
    const canGenerate = await this.checkRateLimit(deliveryTarget);
    if (!canGenerate) {
      metricsService.incrementCounter('otp_rate_limited_total', { delivery_target: deliveryTarget });
      throw new Error('OTP requests rate limited. Please try again later.');
    }
    
    // Generate OTP
    const otp = this.generateOTPCode();
    
    // Set expiry time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.otpExpiry);
    
    // Store in database
    const otpRecord = await this.prisma.otp.create({
      data: {
        id: uuidv4(),
        userId,
        type,
        otp: await this.hashOTP(otp), // Store hashed OTP for security
        deliveryTarget,
        deliveryMethod,
        expiresAt,
        attempts: 0,
        status: OtpStatus.ACTIVE,
        metadata: {}
      }
    });
    
    // Increment metrics
    metricsService.incrementCounter('otp_generated_total', { type, delivery_method: deliveryMethod });
    metricsService.incrementGauge('otp_active_total');
    
    // Emit event for logging and monitoring
    eventEmitter.emit('otp:generated', {
      otpId: otpRecord.id,
      type,
      deliveryTarget,
      deliveryMethod,
      userId
    });
    
    logger.info('OTP generated', { otpId: otpRecord.id, type, deliveryMethod });
    
    // Return the plain OTP and ID
    return {
      otpId: otpRecord.id,
      otp,
      expiresAt
    };
  }
  
  /**
   * Verify an OTP
   * @param otpId The OTP record ID
   * @param otpCode The OTP code to verify
   */
  async verifyOTP(otpId: string, otpCode: string): Promise<{ 
    success: boolean;
    message?: string;
    userId?: string;
    type?: OtpType;
  }> {
    // Find OTP record
    const otpRecord = await this.prisma.otp.findUnique({
      where: { id: otpId }
    });
    
    // Check if OTP exists
    if (!otpRecord) {
      logger.warn('OTP verification failed: OTP not found', { otpId });
      metricsService.incrementCounter('otp_verified_total', { success: 'false', type: 'unknown' });
      return { success: false, message: 'Invalid OTP' };
    }
    
    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt || otpRecord.status !== OtpStatus.ACTIVE) {
      logger.warn('OTP verification failed: OTP expired or inactive', { otpId });
      metricsService.incrementCounter('otp_verified_total', { success: 'false', type: otpRecord.type });
      
      // Mark as expired if not already
      if (otpRecord.status !== OtpStatus.EXPIRED) {
        await this.prisma.otp.update({
          where: { id: otpId },
          data: { status: OtpStatus.EXPIRED }
        });
        metricsService.incrementCounter('otp_expired_total');
        metricsService.decrementGauge('otp_active_total');
      }
      
      return { success: false, message: 'OTP expired or already used' };
    }
    
    // Check if max attempts reached
    if (otpRecord.attempts >= this.maxAttempts) {
      logger.warn('OTP verification failed: Max attempts reached', { otpId });
      
      // Mark as expired
      await this.prisma.otp.update({
        where: { id: otpId },
        data: { status: OtpStatus.EXPIRED }
      });
      
      metricsService.incrementCounter('otp_verified_total', { success: 'false', type: otpRecord.type });
      metricsService.decrementGauge('otp_active_total');
      
      return { success: false, message: 'Maximum verification attempts exceeded' };
    }
    
    // Increment attempts
    await this.prisma.otp.update({
      where: { id: otpId },
      data: { attempts: { increment: 1 } }
    });
    
    // Verify OTP
    const isValid = await this.verifyOTPHash(otpCode, otpRecord.otp);
    
    if (!isValid) {
      logger.warn('OTP verification failed: Invalid code', { otpId, attempts: otpRecord.attempts + 1 });
      
      const remainingAttempts = this.maxAttempts - (otpRecord.attempts + 1);
      
      metricsService.incrementCounter('otp_verified_total', { success: 'false', type: otpRecord.type });
      
      return { 
        success: false, 
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
      };
    }
    
    // Mark OTP as used
    await this.prisma.otp.update({
      where: { id: otpId },
      data: { status: OtpStatus.USED, usedAt: new Date() }
    });
    
    logger.info('OTP verified successfully', { otpId, type: otpRecord.type });
    metricsService.incrementCounter('otp_verified_total', { success: 'true', type: otpRecord.type });
    metricsService.decrementGauge('otp_active_total');
    
    // Emit event for successful verification
    eventEmitter.emit('otp:verified', {
      otpId,
      type: otpRecord.type,
      userId: otpRecord.userId,
      deliveryTarget: otpRecord.deliveryTarget
    });
    
    return { 
      success: true, 
      userId: otpRecord.userId,
      type: otpRecord.type as OtpType
    };
  }
  
  /**
   * Invalidate an OTP
   * @param otpId The OTP ID to invalidate
   */
  async invalidateOTP(otpId: string): Promise<boolean> {
    const otpRecord = await this.prisma.otp.findUnique({
      where: { id: otpId }
    });
    
    if (!otpRecord || otpRecord.status !== OtpStatus.ACTIVE) {
      return false;
    }
    
    await this.prisma.otp.update({
      where: { id: otpId },
      data: { status: OtpStatus.CANCELLED }
    });
    
    metricsService.decrementGauge('otp_active_total');
    logger.info('OTP invalidated', { otpId });
    
    return true;
  }
  
  /**
   * Get an OTP record by ID
   */
  async getOtpRecord(otpId: string) {
    return this.prisma.otp.findUnique({
      where: { id: otpId }
    });
  }

  /**
   * Check if a user or device can request a new OTP (rate limiting)
   */
  async checkRateLimit(deliveryTarget: string): Promise<boolean> {
    const recentTime = new Date();
    recentTime.setSeconds(recentTime.getSeconds() - this.cooldownPeriod);
    
    // Count recent OTP requests for this target
    const recentOtps = await this.prisma.otp.count({
      where: {
        deliveryTarget,
        createdAt: {
          gte: recentTime
        }
      }
    });
    
    // If any recent OTPs found within cooldown period, rate limit
    return recentOtps === 0;
  }
  
  /**
   * Clean up expired OTPs (to be called by scheduler)
   */
  async cleanupExpiredOTPs(): Promise<number> {
    const now = new Date();
    
    // Find expired but not marked OTPs
    const expiredOtps = await this.prisma.otp.findMany({
      where: {
        expiresAt: {
          lt: now
        },
        status: OtpStatus.ACTIVE
      }
    });
    
    // Mark them as expired
    if (expiredOtps.length > 0) {
      await this.prisma.otp.updateMany({
        where: {
          id: {
            in: expiredOtps.map(otp => otp.id)
          }
        },
        data: {
          status: OtpStatus.EXPIRED
        }
      });
      
      metricsService.incrementCounter('otp_expired_total', expiredOtps.length);
      metricsService.decrementGauge('otp_active_total', expiredOtps.length);
      
      logger.info(`Cleaned up ${expiredOtps.length} expired OTPs`);
    }
    
    return expiredOtps.length;
  }
  
  /**
   * Generate a new OTP code
   */
  private generateOTPCode(): string {
    if (this.alphanumeric) {
      // Alphanumeric OTP
      return crypto.randomBytes(Math.ceil(this.otpLength * 3 / 4))
        .toString('base64')
        .replace(/[+/=]/g, '')
        .substring(0, this.otpLength)
        .toUpperCase();
    } else {
      // Numeric OTP
      const min = Math.pow(10, this.otpLength - 1);
      const max = Math.pow(10, this.otpLength) - 1;
      return Math.floor(min + Math.random() * (max - min + 1)).toString();
    }
  }
  
  /**
   * Hash OTP for secure storage
   */
  private async hashOTP(otp: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Generate random salt
      crypto.randomBytes(16, (err, salt) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Hash with PBKDF2
        crypto.pbkdf2(otp, salt, 1000, 64, 'sha512', (err, derivedKey) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Format as salt:hash
          resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
        });
      });
    });
  }
  
  /**
   * Verify OTP hash
   */
  private async verifyOTPHash(otp: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [saltHex, hashHex] = hash.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      
      crypto.pbkdf2(otp, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(derivedKey.toString('hex') === hashHex);
      });
    });
  }
}

// Export default singleton instance with default settings
export const otpService = new OTPService();

// Export for specific custom instances
export default OTPService;
