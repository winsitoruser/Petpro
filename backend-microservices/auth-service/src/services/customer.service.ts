import { User, Pet, NotificationPreference, PushToken, SavedVendor } from '../models';
import { Op } from 'sequelize';
import { uploadToS3, generateSignedUrl } from '../utils/s3';
import logger from '../utils/logger';

/**
 * Get customer profile information
 * @param userId User ID
 * @returns Customer profile data
 */

export const getCustomerProfile = async (userId: string) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password', 'createdAt', 'updatedAt', 'deletedAt']
      }
    });

    if (!user || user.role !== 'customer') {
      return null;
    }

    // If profile image exists, generate signed URL
    if (user.profileImage) {
      user.profileImage = await generateSignedUrl(user.profileImage);
    }

    return user;
  } catch (error) {
    logger.error('Error in getCustomerProfile service', { error, userId });
    throw error;
  }
};

/**
 * Update customer profile
 * @param userId User ID
 * @param updateData Profile data to update
 * @returns Updated profile
 */
export const updateCustomerProfile = async (userId: string, updateData: any) => {
  try {
    // Fields that are allowed to be updated
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'preferredLanguage',
      'address',
      'city',
      'state',
      'postalCode',
      'country'
    ];

    // Filter out non-allowed fields
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    await User.update(filteredData, {
      where: {
        id: userId,
        role: 'customer'
      }
    });

    return getCustomerProfile(userId);
  } catch (error) {
    logger.error('Error in updateCustomerProfile service', { error, userId });
    throw error;
  }
};

/**
 * Save profile image for customer
 * @param userId User ID
 * @param file Uploaded file
 * @returns URL of saved image
 */
export const saveProfileImage = async (userId: string, file: Express.Multer.File) => {
  try {
    const key = `profile-images/${userId}/${Date.now()}-${file.originalname}`;
    const result = await uploadToS3(userId, file);

    await User.update({
      profileImage: key
    } as any, {
      where: {
        id: userId,
        role: 'customer'
      }
    });

    return await generateSignedUrl(key);
  } catch (error) {
    logger.error('Error in saveProfileImage service', { error, userId });
    throw error;
  }
};

/**
 * Get all pets for a customer
 * @param userId Customer user ID
 * @returns Array of pets
 */
export const getCustomerPets = async (userId: string) => {
  try {
    const pets = await Pet.findAll({
      where: {
        userId,
        deletedAt: null
      },
      order: [['createdAt', 'DESC']]
    });

    // Generate signed URLs for pet images
    for (const pet of pets) {
      if (pet.imageUrl) {
        pet.imageUrl = await generateSignedUrl(pet.imageUrl);
      }
    }

    return pets;
  } catch (error) {
    logger.error('Error in getCustomerPets service', { error, userId });
    throw error;
  }
};

/**
 * Add a new pet for a customer
 * @param userId Customer user ID
 * @param petData Pet data to create
 * @returns Newly created pet
 */
export const addPet = async (userId: string, petData: any) => {
  try {
    const newPet = await Pet.create({
      ...petData,
      userId
    });

    return newPet;
  } catch (error) {
    logger.error('Error in addPet service', { error, userId });
    throw error;
  }
};

/**
 * Update an existing pet
 * @param userId Customer user ID
 * @param petId Pet ID to update
 * @param petData Updated pet data
 * @returns Updated pet or null if not found
 */
export const updatePet = async (userId: string, petId: string, petData: any) => {
  try {
    const [updated] = await Pet.update(petData, {
      where: {
        id: petId,
        userId
      }
    });

    if (updated === 0) {
      return null;
    }

    const updatedPet = await Pet.findByPk(petId);
    return updatedPet;
  } catch (error) {
    logger.error('Error in updatePet service', { error, userId, petId });
    throw error;
  }
};

/**
 * Delete a pet (soft delete)
 * @param userId Customer user ID
 * @param petId Pet ID to delete
 * @returns boolean indicating success
 */
export const deletePet = async (userId: string, petId: string) => {
  try {
    const deleted = await Pet.update(
      { deletedAt: new Date() },
      {
        where: {
          id: petId,
          userId
        }
      }
    );

    return deleted[0] > 0;
  } catch (error) {
    logger.error('Error in deletePet service', { error, userId, petId });
    throw error;
  }
};

/**
 * Get notification preferences for a customer
 * @param userId Customer user ID
 * @returns Notification preferences
 */
export const getNotificationPreferences = async (userId: string) => {
  try {
    let preferences = await NotificationPreference.findOne({
      where: { userId }
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId,
        bookingReminders: true,
        bookingUpdates: true,
        promotions: true,
        serviceUpdates: true,
        petHealthReminders: true,
        appUpdates: true
      });
    }

    return preferences;
  } catch (error) {
    logger.error('Error in getNotificationPreferences service', { error, userId });
    throw error;
  }
};

/**
 * Update notification preferences
 * @param userId Customer user ID
 * @param preferences New preferences
 * @returns Updated preferences
 */
export const updateNotificationPreferences = async (userId: string, preferences: any) => {
  try {
    // Check if preferences exist
    const existingPreferences = await NotificationPreference.findOne({
      where: { userId }
    });

    // Create or update preferences
    if (existingPreferences) {
      await NotificationPreference.update(preferences, {
        where: { userId }
      });
    } else {
      await NotificationPreference.create({
        userId,
        ...preferences
      });
    }

    // Return the updated preferences
    return await getNotificationPreferences(userId);
  } catch (error) {
    logger.error('Error in updateNotificationPreferences service', { error, userId });
    throw error;
  }
};

/**
 * Register push notification token
 * @param userId User ID
 * @param token Push token
 * @param deviceId Device ID
 * @param platform Device platform (ios, android)
 * @returns Created or updated token
 */
export const registerPushToken = async (
  userId: string,
  token: string,
  deviceId: string,
  platform: string
) => {
  try {
    const [pushToken, created] = await PushToken.findOrCreate({
      where: { userId, deviceId },
      defaults: {
        token,
        platform,
        active: true
      }
    });

    // Update token if it already exists
    if (!created) {
      await pushToken.update({
        token,
        platform,
        active: true
      });
    }

    return pushToken;
  } catch (error) {
    logger.error('Error in registerPushToken service', { error, userId, deviceId });
    throw error;
  }
};

/**
 * Unregister push notification token
 * @param userId User ID
 * @param deviceId Device ID
 */
export const unregisterPushToken = async (userId: string, deviceId: string) => {
  try {
    await PushToken.update(
      { active: false },
      {
        where: {
          userId,
          deviceId
        }
      }
    );
  } catch (error) {
    logger.error('Error in unregisterPushToken service', { error, userId, deviceId });
    throw error;
  }
};

/**
 * Get saved vendors for a customer
 * @param userId Customer user ID
 * @returns List of saved vendors
 */
export const getSavedVendors = async (userId: string) => {
  try {
    const savedVendors = await SavedVendor.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'businessName', 'profileImage', 'address', 'city', 'state']
        }
      ]
    });

    // Generate signed URLs for vendor profile images
    for (const item of savedVendors) {
      if (item.vendor && item.vendor.profileImage) {
        item.vendor.profileImage = await generateSignedUrl(item.vendor.profileImage);
      }
    }

    return savedVendors.map(item => item.vendor);
  } catch (error) {
    logger.error('Error in getSavedVendors service', { error, userId });
    throw error;
  }
};

/**
 * Save a vendor to favorites
 * @param userId Customer user ID
 * @param vendorId Vendor user ID
 * @returns Created saved vendor entry or null if already exists
 */
export const saveVendor = async (userId: string, vendorId: string) => {
  try {
    // Check if vendor exists and is actually a vendor
    const vendor = await User.findOne({
      where: {
        id: vendorId,
        role: 'vendor'
      }
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Check if already saved
    const existing = await SavedVendor.findOne({
      where: {
        userId,
        vendorId
      }
    });

    if (existing) {
      return { alreadySaved: true };
    }

    // Save vendor
    const savedVendor = await SavedVendor.create({
      userId,
      vendorId
    });

    return { success: true, savedVendor };
  } catch (error) {
    logger.error('Error in saveVendor service', { error, userId, vendorId });
    throw error;
  }
};

/**
 * Remove a vendor from favorites
 * @param userId Customer user ID
 * @param vendorId Vendor user ID
 */
export const unsaveVendor = async (userId: string, vendorId: string) => {
  try {
    await SavedVendor.destroy({
      where: {
        userId,
        vendorId
      }
    });
  } catch (error) {
    logger.error('Error in unsaveVendor service', { error, userId, vendorId });
    throw error;
  }
};
