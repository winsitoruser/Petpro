import { Router } from 'express';
import { body, param } from 'express-validator';
import * as customerController from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { customerOnly } from '../middleware/role.middleware';
import uploadMiddleware from '../middleware/upload.middleware';

const router = Router();

/**
 * Customer profile routes
 */
router.get(
  '/profile',
  authenticate,
  customerOnly,
  customerController.getProfile
);

router.patch(
  '/profile',
  authenticate,
  customerOnly,
  [
    body('firstName').optional().isString().trim().isLength({ min: 2, max: 50 }),
    body('lastName').optional().isString().trim().isLength({ min: 2, max: 50 }),
    body('phoneNumber').optional().isString().trim(),
    body('preferredLanguage').optional().isIn(['en', 'ja', 'id']),
    body('address').optional().isString().trim(),
    body('city').optional().isString().trim(),
    body('state').optional().isString().trim(),
    body('postalCode').optional().isString().trim(),
    body('country').optional().isString().trim().isLength({ min: 2, max: 2 })
  ],
  customerController.updateProfile
);

router.post(
  '/profile/image',
  authenticate,
  customerOnly,
  uploadMiddleware.single('profileImage'),
  customerController.uploadProfileImage
);

/**
 * Pet management routes
 */
router.get(
  '/pets',
  authenticate,
  customerOnly,
  customerController.getPets
);

router.post(
  '/pets',
  authenticate,
  customerOnly,
  [
    body('name').isString().trim().notEmpty().isLength({ max: 50 }),
    body('species').isString().trim().notEmpty().isLength({ max: 50 }),
    body('breed').isString().trim().optional().isLength({ max: 50 }),
    body('birthdate').optional().isISO8601(),
    body('gender').isIn(['male', 'female', 'unknown']),
    body('weight').optional().isFloat({ min: 0 }),
    body('microchipId').optional().isString().trim(),
    body('notes').optional().isString().trim()
  ],
  customerController.addPet
);

router.patch(
  '/pets/:petId',
  authenticate,
  customerOnly,
  [
    param('petId').isUUID(4),
    body('name').optional().isString().trim().notEmpty().isLength({ max: 50 }),
    body('species').optional().isString().trim().notEmpty().isLength({ max: 50 }),
    body('breed').optional().isString().trim().isLength({ max: 50 }),
    body('birthdate').optional().isISO8601(),
    body('gender').optional().isIn(['male', 'female', 'unknown']),
    body('weight').optional().isFloat({ min: 0 }),
    body('microchipId').optional().isString().trim(),
    body('notes').optional().isString().trim()
  ],
  customerController.updatePet
);

router.delete(
  '/pets/:petId',
  authenticate,
  customerOnly,
  [param('petId').isUUID(4)],
  customerController.deletePet
);

/**
 * Notification preferences routes
 */
router.get(
  '/notifications/preferences',
  authenticate,
  customerOnly,
  customerController.getNotificationPreferences
);

router.put(
  '/notifications/preferences',
  authenticate,
  customerOnly,
  [
    body('bookingReminders').optional().isBoolean(),
    body('bookingUpdates').optional().isBoolean(),
    body('promotions').optional().isBoolean(),
    body('serviceUpdates').optional().isBoolean(),
    body('petHealthReminders').optional().isBoolean(),
    body('appUpdates').optional().isBoolean()
  ],
  customerController.updateNotificationPreferences
);

router.post(
  '/notifications/push-token',
  authenticate,
  customerOnly,
  [
    body('token').isString().trim().notEmpty(),
    body('deviceId').isString().trim().notEmpty(),
    body('platform').isIn(['ios', 'android', 'web'])
  ],
  customerController.registerPushToken
);

router.delete(
  '/notifications/push-token',
  authenticate,
  customerOnly,
  [
    body('deviceId').isString().trim().notEmpty()
  ],
  customerController.unregisterPushToken
);

/**
 * Saved vendors routes
 */
router.get(
  '/saved-vendors',
  authenticate,
  customerOnly,
  customerController.getSavedVendors
);

router.post(
  '/saved-vendors',
  authenticate,
  customerOnly,
  [
    body('vendorId').isUUID(4)
  ],
  customerController.saveVendor
);

router.delete(
  '/saved-vendors/:vendorId',
  authenticate,
  customerOnly,
  [
    param('vendorId').isUUID(4)
  ],
  customerController.unsaveVendor
);

export default router;
