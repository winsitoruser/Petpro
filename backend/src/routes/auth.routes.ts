import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validator';
import { authenticate } from '../middleware/auth';

const router = Router();

// General user registration
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
    body('firstName').optional(),
    body('lastName').optional(),
    body('phone').optional().isMobilePhone('any').withMessage('Please provide a valid phone number'),
    validateRequest
  ],
  authController.register
);

// Vendor-specific registration
router.post(
  '/register/vendor',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
    body('businessName').not().isEmpty().withMessage('Business name is required'),
    body('phone').isMobilePhone('any').withMessage('Please provide a valid phone number'),
    body('serviceTypes').optional().isArray(),
    validateRequest
  ],
  authController.registerVendor
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').not().isEmpty().withMessage('Password is required'),
    validateRequest
  ],
  authController.login
);

// Logout
router.post(
  '/logout',
  [
    body('refreshToken').not().isEmpty().withMessage('Refresh token is required'),
    validateRequest
  ],
  authController.logout
);

// Verify account
router.get('/verify/:token', authController.verifyAccount);

// Resend verification email
router.post(
  '/resend-verification',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validateRequest
  ],
  authController.resendVerification
);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validateRequest
  ],
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').not().isEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number and special character'),
    validateRequest
  ],
  authController.resetPassword
);

// Refresh token
router.post(
  '/refresh-token',
  [
    body('refreshToken').not().isEmpty().withMessage('Refresh token is required'),
    validateRequest
  ],
  authController.refreshToken
);

// Get login history - requires authentication
router.get('/login-history', authenticate, authController.getLoginHistory);

// Get active sessions - requires authentication
router.get('/active-sessions', authenticate, authController.getActiveSessions);

// Terminate a specific session - requires authentication
router.delete('/sessions/:tokenId', authenticate, authController.terminateSession);

export default router;
