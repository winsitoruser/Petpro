/**
 * Authentication Controller
 * 
 * Handles user registration, authentication, and account management
 */
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import AuthService from '../services/db/authService';
import UserService from '../services/db/userService';
import { UserType } from '../types/models';
import { sendEmail } from '../services/email/emailService';

// Initialize services
const authService = new AuthService();
const userService = new UserService();

// Constants
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Helper to validate password strength
 */
const validatePasswordStrength = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  // Check for uppercase, lowercase, number, and special character
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
  if (!hasUppercase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowercase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumber) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecial) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true };
};

/**
 * Handle user registration for customers, vendors, and staff
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      phone, 
      userType = UserType.CUSTOMER, 
      businessName,
      firstName,
      lastName
    } = req.body;

    // Validate email format (additional check beyond express-validator)
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate phone number format if provided
    if (phone && !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    
    // Check for duplicate email
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email });
      return res.status(409).json({ message: 'Email is already registered' });
    }
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hour expiry
    
    // Create user
    const user = await userService.createUser({
      email,
      passwordHash,
      userType,
      phone,
      profile: {
        firstName,
        lastName,
        displayName: businessName || `${firstName} ${lastName}`,
      }
    });
    
    // Store verification token in database
    await userService.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: verificationTokenExpiry
      }
    });
    
    // Send verification email
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email address',
      template: 'email-verification',
      context: {
        name: firstName || businessName || email,
        verificationUrl
      }
    });
    
    // Log successful registration
    logger.info('User registered successfully', { 
      userId: user.id, 
      email, 
      userType 
    });
    
    // Track registration attempt for security monitoring
    await authService.recordSecurityEvent({
      userId: user.id,
      eventType: 'USER_REGISTERED',
      description: `User registered with email ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id
    });
    
  } catch (error: any) {
    logger.error('Registration error', { error: error.message });
    return res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
};

/**
 * Handle vendor-specific registration
 */
export const registerVendor = async (req: Request, res: Response) => {
  try {
    // Add vendor-specific data to the request
    req.body.userType = UserType.VENDOR;
    
    // Additional vendor-specific validation
    const { businessName, serviceTypes } = req.body;
    
    if (!businessName) {
      return res.status(400).json({ message: 'Business name is required for vendor registration' });
    }
    
    // Use the regular registration handler
    return await register(req, res);
    
  } catch (error: any) {
    logger.error('Vendor registration error', { error: error.message });
    return res.status(500).json({ message: 'Vendor registration failed. Please try again later.' });
  }
};

/**
 * Handle email verification
 */
export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Find verification token
    const verification = await userService.prisma.emailVerification.findFirst({
      where: { 
        token,
        expiresAt: { 
          gte: new Date() 
        }
      }
    });
    
    if (!verification) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Update user verification status
    await userService.prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true }
    });
    
    // Mark token as used
    await userService.prisma.emailVerification.update({
      where: { id: verification.id },
      data: { usedAt: new Date() }
    });
    
    logger.info('Email verified successfully', { userId: verification.userId });
    
    // Record security event
    const user = await userService.prisma.user.findUnique({
      where: { id: verification.userId },
      select: { id: true, email: true }
    });
    
    if (user) {
      await authService.recordSecurityEvent({
        userId: user.id,
        eventType: 'EMAIL_VERIFIED',
        description: `Email verified for ${user.email}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    
    return res.status(200).json({ message: 'Email verification successful. You can now log in.' });
    
  } catch (error: any) {
    logger.error('Email verification error', { error: error.message });
    return res.status(500).json({ message: 'Email verification failed. Please try again later.' });
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await userService.findByEmail(email);
    
    if (!user) {
      // For security, don't reveal if email exists
      return res.status(200).json({ message: 'If the email exists, a verification link has been sent.' });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 hour expiry
    
    // Store new verification token
    await userService.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: verificationTokenExpiry
      }
    });
    
    // Send verification email
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify your email address',
      template: 'email-verification',
      context: {
        name: user.profile?.firstName || user.profile?.displayName || email,
        verificationUrl
      }
    });
    
    logger.info('Verification email resent', { userId: user.id, email });
    
    return res.status(200).json({ message: 'Verification email has been sent.' });
    
  } catch (error: any) {
    logger.error('Resend verification error', { error: error.message });
    return res.status(500).json({ message: 'Failed to resend verification email. Please try again later.' });
  }
};

/**
 * Handle user login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await authService.findUserByEmail(email);
    
    // Check if user exists
    if (!user) {
      // Log failed attempt
      await authService.logLoginAttempt({
        email,
        success: false,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        failureReason: 'User not found'
      });
      
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if account is locked
    const isLocked = await authService.isAccountLocked(user.id);
    if (isLocked) {
      await authService.logLoginAttempt({
        userId: user.id,
        email,
        success: false,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        failureReason: 'Account locked'
      });
      
      return res.status(401).json({ message: 'Account is temporarily locked. Please try again later or contact support.' });
    }
    
    // Check email verification status
    if (!user.emailVerified) {
      await authService.logLoginAttempt({
        userId: user.id,
        email,
        success: false,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        failureReason: 'Email not verified'
      });
      
      return res.status(401).json({ 
        message: 'Email not verified. Please verify your email before logging in.',
        requiresVerification: true
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
      // Handle failed login
      await authService.logLoginAttempt({
        userId: user.id,
        email,
        success: false,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        failureReason: 'Invalid password'
      });
      
      // Check for account lockout
      const shouldLock = await authService.handleFailedLoginAttempt(email, {
        ipAddress: req.ip,
        maxAttempts: 5,
        lockoutDurationMinutes: 30
      });
      
      if (shouldLock) {
        return res.status(401).json({ 
          message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.' 
        });
      }
      
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        userType: user.userType
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Create refresh token
    const refreshToken = await authService.createRefreshToken(
      user.id,
      {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string
      }
    );
    
    // Update last login time
    await userService.updateLastLogin(user.id);
    
    // Log successful login
    await authService.logLoginAttempt({
      userId: user.id,
      email,
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string
    });
    
    logger.info('User logged in successfully', { userId: user.id, email });
    
    // Return tokens and user data
    return res.status(200).json({
      token,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        displayName: user.profile?.displayName
      }
    });
    
  } catch (error: any) {
    logger.error('Login error', { error: error.message });
    return res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

/**
 * Handle refresh token
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    // Validate refresh token
    const refreshTokenData = await authService.validateRefreshToken(refreshToken);
    
    if (!refreshTokenData) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
    
    // Get the user
    const user = refreshTokenData.user;
    
    // Generate new JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        userType: user.userType
      }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    logger.info('Token refreshed successfully', { userId: user.id });
    
    return res.status(200).json({
      token,
      refreshToken: refreshTokenData.token
    });
    
  } catch (error: any) {
    logger.error('Token refresh error', { error: error.message });
    return res.status(500).json({ message: 'Failed to refresh token. Please log in again.' });
  }
};

/**
 * Handle forgot password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // Create password reset token
    const resetToken = await authService.createPasswordReset(email, {
      ipAddress: req.ip,
      expiryHours: 24
    });
    
    // If user not found, still return success for security
    if (!resetToken) {
      logger.info('Forgot password request for non-existent email', { email });
      return res.status(200).json({ message: 'If the email exists, a password reset link has been sent.' });
    }
    
    // Send password reset email
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken.token}`;
    
    const user = await userService.findByEmail(email);
    
    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      template: 'password-reset',
      context: {
        name: user?.profile?.firstName || user?.profile?.displayName || email,
        resetUrl
      }
    });
    
    logger.info('Password reset email sent', { userId: resetToken.userId, email });
    
    return res.status(200).json({ message: 'If the email exists, a password reset link has been sent.' });
    
  } catch (error: any) {
    logger.error('Forgot password error', { error: error.message });
    return res.status(500).json({ message: 'Failed to process forgot password request. Please try again later.' });
  }
};

/**
 * Handle reset password
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    
    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Complete password reset
    const user = await authService.completePasswordReset(token, passwordHash);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    logger.info('Password reset completed successfully', { userId: user.id, email: user.email });
    
    // Record security event
    await authService.recordSecurityEvent({
      userId: user.id,
      eventType: 'PASSWORD_RESET',
      description: 'Password reset completed',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(200).json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
    
  } catch (error: any) {
    logger.error('Reset password error', { error: error.message });
    return res.status(500).json({ message: 'Failed to reset password. Please try again later.' });
  }
};

/**
 * Handle logout
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Validate and get token data
    const refreshTokenData = await authService.validateRefreshToken(refreshToken);
    
    if (!refreshTokenData) {
      // Token already invalid, still return success
      return res.status(200).json({ message: 'Logged out successfully' });
    }
    
    // Revoke the refresh token
    await authService.revokeRefreshToken(refreshToken, {
      reason: 'User logout'
    });
    
    logger.info('User logged out successfully', { userId: refreshTokenData.userId });
    
    return res.status(200).json({ message: 'Logged out successfully' });
    
  } catch (error: any) {
    logger.error('Logout error', { error: error.message });
    return res.status(500).json({ message: 'Failed to logout. Please try again later.' });
  }
};

/**
 * Get user login history
 */
export const getLoginHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const loginHistory = await authService.getUserLoginHistory(userId, {
      take: 10
    });
    
    return res.status(200).json(loginHistory);
    
  } catch (error: any) {
    logger.error('Get login history error', { error: error.message });
    return res.status(500).json({ message: 'Failed to retrieve login history. Please try again later.' });
  }
};

/**
 * Get active sessions
 */
export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    
    const sessions = await authService.getActiveSessions(userId);
    
    return res.status(200).json(sessions);
    
  } catch (error: any) {
    logger.error('Get active sessions error', { error: error.message });
    return res.status(500).json({ message: 'Failed to retrieve active sessions. Please try again later.' });
  }
};

/**
 * Terminate session
 */
export const terminateSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { tokenId } = req.params;
    
    // Get the token
    const token = await userService.prisma.refreshToken.findFirst({
      where: { 
        id: tokenId,
        userId
      }
    });
    
    if (!token) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Revoke the token
    await authService.revokeRefreshToken(token.token, {
      reason: 'User terminated session'
    });
    
    logger.info('Session terminated successfully', { userId, tokenId });
    
    return res.status(200).json({ message: 'Session terminated successfully' });
    
  } catch (error: any) {
    logger.error('Terminate session error', { error: error.message });
    return res.status(500).json({ message: 'Failed to terminate session. Please try again later.' });
  }
};
