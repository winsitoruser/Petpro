import { Request, Response } from 'express';
import * as customerService from '../services/customer.service';
import { StatusCodes } from 'http-status-codes';
import { validationResult } from 'express-validator';
import logger from '../utils/logger';
import i18n from '../i18n';

/**
 * Get current customer profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const customer = await customerService.getCustomerProfile(userId);
    if (!customer) {
      res.status(StatusCodes.NOT_FOUND).json({ message: i18n.__('customer.notFound') });
      return;
    }

    res.status(StatusCodes.OK).json(customer);
  } catch (error) {
    logger.error('Error getting customer profile', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Update customer profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const updateData = req.body;
    const updatedCustomer = await customerService.updateCustomerProfile(userId, updateData);

    res.status(StatusCodes.OK).json(updatedCustomer);
  } catch (error) {
    logger.error('Error updating customer profile', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    if (!req.file) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: i18n.__('customer.noFileUploaded') });
      return;
    }

    const imageUrl = await customerService.saveProfileImage(userId, req.file);
    res.status(StatusCodes.OK).json({ imageUrl });
  } catch (error) {
    logger.error('Error uploading profile image', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get customer pets
 */
export const getPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const pets = await customerService.getCustomerPets(userId);
    res.status(StatusCodes.OK).json(pets);
  } catch (error) {
    logger.error('Error getting customer pets', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Add a new pet
 */
export const addPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const petData = req.body;
    const newPet = await customerService.addPet(userId, petData);

    res.status(StatusCodes.CREATED).json(newPet);
  } catch (error) {
    logger.error('Error adding pet', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Update a pet
 */
export const updatePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const petId = req.params.petId;
    const petData = req.body;

    const updatedPet = await customerService.updatePet(userId, petId, petData);
    if (!updatedPet) {
      res.status(StatusCodes.NOT_FOUND).json({ message: i18n.__('pet.notFound') });
      return;
    }

    res.status(StatusCodes.OK).json(updatedPet);
  } catch (error) {
    logger.error('Error updating pet', { error, userId: req.user?.id, petId: req.params.petId });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Delete a pet
 */
export const deletePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const petId = req.params.petId;
    const success = await customerService.deletePet(userId, petId);

    if (!success) {
      res.status(StatusCodes.NOT_FOUND).json({ message: i18n.__('pet.notFound') });
      return;
    }

    res.status(StatusCodes.OK).json({ message: i18n.__('pet.deleted') });
  } catch (error) {
    logger.error('Error deleting pet', { error, userId: req.user?.id, petId: req.params.petId });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const preferences = await customerService.getNotificationPreferences(userId);
    res.status(StatusCodes.OK).json(preferences);
  } catch (error) {
    logger.error('Error getting notification preferences', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const preferences = req.body;
    const updatedPreferences = await customerService.updateNotificationPreferences(userId, preferences);

    res.status(StatusCodes.OK).json(updatedPreferences);
  } catch (error) {
    logger.error('Error updating notification preferences', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Register push notification token
 */
export const registerPushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const { token, deviceId, platform } = req.body;
    if (!token || !deviceId || !platform) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: i18n.__('notifications.missingTokenInfo') });
      return;
    }

    const result = await customerService.registerPushToken(userId, token, deviceId, platform);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error('Error registering push token', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Unregister push notification token
 */
export const unregisterPushToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const { deviceId } = req.body;
    if (!deviceId) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: i18n.__('notifications.missingDeviceId') });
      return;
    }

    await customerService.unregisterPushToken(userId, deviceId);
    res.status(StatusCodes.OK).json({ success: true });
  } catch (error) {
    logger.error('Error unregistering push token', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Get customer saved vendors
 */
export const getSavedVendors = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const savedVendors = await customerService.getSavedVendors(userId);
    res.status(StatusCodes.OK).json(savedVendors);
  } catch (error) {
    logger.error('Error getting saved vendors', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Save a vendor to favorites
 */
export const saveVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const { vendorId } = req.body;
    if (!vendorId) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: i18n.__('customer.missingVendorId') });
      return;
    }

    const result = await customerService.saveVendor(userId, vendorId);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    logger.error('Error saving vendor', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};

/**
 * Remove a vendor from favorites
 */
export const unsaveVendor = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: i18n.__('auth.unauthorized') });
      return;
    }

    const vendorId = req.params.vendorId;
    
    await customerService.unsaveVendor(userId, vendorId);
    res.status(StatusCodes.OK).json({ success: true });
  } catch (error) {
    logger.error('Error removing saved vendor', { error, userId: req.user?.id });
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: i18n.__('common.serverError') });
  }
};
