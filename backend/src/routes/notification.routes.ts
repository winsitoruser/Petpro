import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';
import NotificationService from '../services/db/notificationService';

// Type definitions
type NotificationPriority = 'low' | 'medium' | 'high';
type NotificationCategory = 'appointment' | 'order' | 'system' | 'promotion' | 'review';

const router = Router();
const notificationService = new NotificationService();

/**
 * Get unread notifications for a user
 * GET /notifications/unread/:userId
 */
router.get(
  '/unread/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    query('skip').optional().isInt({ min: 0 }).toInt(),
    query('take').optional().isInt({ min: 1, max: 50 }).toInt(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { skip = 0, take = 10 } = req.query;

      const notifications = await notificationService.getUnreadNotifications(
        userId,
        { skip: Number(skip), take: Number(take) }
      );

      return res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Mark notifications as read
 * POST /notifications/mark-read
 */
router.post(
  '/mark-read',
  [
    body('notificationIds').isArray().withMessage('Notification IDs must be an array'),
    body('notificationIds.*').isUUID().withMessage('Each notification ID must be a valid UUID'),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notificationIds } = req.body;

      const result = await notificationService.markAsRead(notificationIds);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Mark all notifications as read for a user
 * POST /notifications/mark-all-read/:userId
 */
router.post(
  '/mark-all-read/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const result = await notificationService.markAllAsRead(userId);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create a notification for a user
 * POST /notifications
 */
router.post(
  '/',
  [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('title').isString().trim().notEmpty().withMessage('Title is required'),
    body('content').isString().trim().notEmpty().withMessage('Content is required'),
    body('type').isString().trim().notEmpty().withMessage('Type is required'),
    body('templateId').optional().isUUID(),
    body('relatedEntityId').optional().isString(),
    body('relatedEntityType').optional().isString(),
    body('metadata').optional().isObject(),
    body('deliveryChannels').optional().isArray(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await notificationService.createNotification(req.body);

      return res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Batch create notifications for multiple users
 * POST /notifications/batch
 */
router.post(
  '/batch',
  [
    body('userIds').isArray().withMessage('User IDs must be an array'),
    body('userIds.*').isUUID().withMessage('Each user ID must be a valid UUID'),
    body('title').isString().trim().notEmpty().withMessage('Title is required'),
    body('content').isString().trim().notEmpty().withMessage('Content is required'),
    body('type').isString().trim().notEmpty().withMessage('Type is required'),
    body('templateId').optional().isUUID(),
    body('relatedEntityId').optional().isString(),
    body('relatedEntityType').optional().isString(),
    body('metadata').optional().isObject(),
    body('deliveryChannels').optional().isArray(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await notificationService.batchCreateNotifications(req.body);

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create a notification from a template
 * POST /notifications/from-template
 */
router.post(
  '/from-template',
  [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('templateCode').isString().trim().notEmpty().withMessage('Template code is required'),
    body('substitutions').optional().isObject(),
    body('relatedEntityId').optional().isString(),
    body('relatedEntityType').optional().isString(),
    body('metadata').optional().isObject(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await notificationService.createNotificationFromTemplate(req.body);
      
      if (!notification) {
        return res.status(404).json({ message: 'Template not found or inactive' });
      }

      return res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create or update notification preferences for a user
 * PUT /notifications/preferences/:userId
 */
router.put(
  '/preferences/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    body().isArray().withMessage('Request body must be an array of preferences'),
    body('*.notificationType').isString().trim().notEmpty().withMessage('Notification type is required'),
    body('*.isEnabled').isBoolean().withMessage('isEnabled must be a boolean'),
    body('*.channels').optional().isArray(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const preferences = req.body;

      const result = await notificationService.upsertNotificationPreferences(userId, preferences);

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get notification preferences for a user
 * GET /notifications/preferences/:userId
 */
router.get(
  '/preferences/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const preferences = await notificationService.getNotificationPreferences(userId);

      return res.status(200).json(preferences);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Create a notification template
 * POST /notifications/templates
 */
router.post(
  '/templates',
  [
    body('code').isString().trim().notEmpty().withMessage('Code is required'),
    body('title').isString().trim().notEmpty().withMessage('Title is required'),
    body('content').isString().trim().notEmpty().withMessage('Content is required'),
    body('type').isString().trim().notEmpty().withMessage('Type is required'),
    body('deliveryChannels').optional().isArray(),
    body('metadata').optional().isObject(),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await notificationService.createNotificationTemplate(req.body);

      return res.status(201).json(template);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get notification template by code
 * GET /notifications/templates/:code
 */
router.get(
  '/templates/:code',
  [
    param('code').isString().trim().notEmpty().withMessage('Template code is required'),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;

      const template = await notificationService.getNotificationTemplate(code);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found or inactive' });
      }

      return res.status(200).json(template);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get notification statistics for a user
 * GET /notifications/stats/:userId
 */
router.get(
  '/stats/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    validateRequest,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      const stats = await notificationService.getUserNotificationStats(userId);

      return res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
