/**
 * OTP Routes
 * 
 * API endpoints for OTP generation, verification, and management
 */
import { Router, Request, Response, NextFunction } from 'express';
import { otpController } from '../controllers/otp.controller';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import config from '../config/env';

// Optional auth middleware that doesn't require authentication but populates req.user if token exists
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = decoded;
    } catch (err) {
      // Ignore token errors in optional auth
    }
    
    next();
  } catch (error) {
    next();
  }
};
import { OtpType, OtpDeliveryMethod } from '../types/otp';

const router = Router();

/**
 * @route POST /api/otp/generate
 * @desc Generate an OTP for a specific purpose and send it
 * @access Public (with optional auth)
 */
router.post('/generate', 
  optionalAuth,
  [
    body('type')
      .isIn(Object.values(OtpType))
      .withMessage('Invalid OTP type'),
    body('deliveryMethod')
      .isIn(Object.values(OtpDeliveryMethod))
      .withMessage('Invalid delivery method'),
    body('deliveryTarget')
      .isString()
      .notEmpty()
      .withMessage('Delivery target (email/phone) is required'),
  ],
  validateRequest,
  otpController.generateOTP.bind(otpController)
);

/**
 * @route POST /api/otp/verify
 * @desc Verify an OTP code
 * @access Public
 */
router.post('/verify', 
  [
    body('otpId')
      .isUUID()
      .withMessage('Valid OTP ID is required'),
    body('otpCode')
      .isString()
      .notEmpty()
      .withMessage('OTP code is required'),
  ],
  validateRequest,
  otpController.verifyOTP.bind(otpController)
);

/**
 * @route POST /api/otp/resend
 * @desc Resend an OTP (invalidate old one and send new)
 * @access Public
 */
router.post('/resend', 
  [
    body('otpId')
      .isUUID()
      .withMessage('Valid OTP ID is required'),
  ],
  validateRequest,
  otpController.resendOTP.bind(otpController)
);

export default router;
