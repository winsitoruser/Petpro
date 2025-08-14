/**
 * Notification Repository
 * 
 * Repository for notification management operations with specialized methods
 * for notification-specific queries and transactions.
 */
import { Notification, NotificationChannel, NotificationTemplate, NotificationStatus, Prisma } from '@prisma/client';
import { EnhancedRepository } from '../enhancedRepository';
import { withTransaction } from '../../../db/transaction';
import { logger } from '../../../utils/logger';

// Type for notification creation with template
interface CreateNotificationData {
  userId: string;
  title: string;
  content: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  priority?: string;
  scheduledFor?: Date;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, any>;
}

// Type for notification search options
interface NotificationSearchOptions {
  userId?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus[];
  priority?: string;
  read?: boolean;
  startDate?: Date;
  endDate?: Date;
  relatedEntityType?: string;
  relatedEntityId?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export class NotificationRepository extends EnhancedRepository<Notification> {
  constructor() {
    // Select common fields for notification queries
    super('notification', {
      defaultSelect: {
        id: true,
        userId: true,
        title: true,
        content: true,
        channel: true,
        status: true,
        priority: true,
        read: true,
        readAt: true,
        scheduledFor: true,
        sentAt: true,
        relatedEntityId: true,
        relatedEntityType: true,
        createdAt: true
      },
      // Quick access to notifications is important
      enableCache: true,
      cacheTtl: 60, // 1 minute
      cacheKeyPrefix: 'notif:'
    });
  }

  /**
   * Find notifications for a specific user
   */
  async findByUser(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Notification[]> {
    const { unreadOnly = false, limit = 20, offset = 0 } = options;
    
    const where: Prisma.NotificationWhereInput = {
      userId,
      status: 'sent'
    };
    
    if (unreadOnly) {
      where.read = false;
    }
    
    return this.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });
  }

  /**
   * Create a notification from template
   */
  async createFromTemplate(
    data: {
      userId: string;
      templateCode: string;
      substitutions?: Record<string, string>;
      relatedEntityId?: string;
      relatedEntityType?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Notification> {
    return withTransaction(async (tx) => {
      // Find the template
      const template = await tx.notificationTemplate.findFirst({
        where: { 
          name: data.templateCode,
          active: true 
        },
      });
      
      if (!template) {
        throw new Error(`Template not found: ${data.templateCode}`);
      }
      
      // Apply substitutions to template content
      let content = template.content;
      let title = template.title;
      
      if (data.substitutions) {
        for (const [key, value] of Object.entries(data.substitutions)) {
          const placeholder = `{{${key}}}`;
          content = content.replace(new RegExp(placeholder, 'g'), value);
          title = title.replace(new RegExp(placeholder, 'g'), value);
        }
      }
      
      // Check user notification preferences
      const userPrefs = await tx.userNotificationPreference.findUnique({
        where: {
          userId_notificationType: {
            userId: data.userId,
            notificationType: template.notificationType
          }
        }
      });
      
      // Determine if we should send the notification based on user preferences
      if (userPrefs && !userPrefs.enabled) {
        logger.info('Notification not created due to user preferences', {
          userId: data.userId,
          templateCode: data.templateCode
        });
        
        // Return a placeholder notification that won't be sent
        return {
          id: 'skipped',
          userId: data.userId,
          title: title,
          content: content,
          channel: template.defaultChannel,
          status: 'draft',
          priority: template.priority,
          read: false,
          readAt: null,
          scheduledFor: null,
          sentAt: null,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          metadata: data.metadata || {},
          createdAt: new Date(),
          updatedAt: new Date()
        } as Notification;
      }
      
      // Create the notification
      const notification = await tx.notification.create({
        data: {
          userId: data.userId,
          title: title,
          content: content,
          channel: template.defaultChannel,
          status: 'pending',
          priority: template.priority,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          metadata: data.metadata || {}
        }
      });
      
      logger.info('Created notification from template', {
        notificationId: notification.id,
        userId: notification.userId,
        templateCode: data.templateCode
      });
      
      return notification;
    });
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(notificationIds: string[]): Promise<number> {
    const now = new Date();
    
    const result = await this.prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        read: false
      },
      data: {
        read: true,
        readAt: now
      }
    });
    
    // Invalidate cache for these notifications
    if (this.cacheEnabled && result.count > 0) {
      for (const id of notificationIds) {
        await this.invalidateCache(id);
      }
    }
    
    return result.count;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    const now = new Date();
    
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        readAt: now
      }
    });
    
    // Invalidate user's notification cache pattern
    if (this.cacheEnabled && result.count > 0) {
      await this.invalidateCachePattern(`${this.cacheKeyPrefix}*:user:${userId}:*`);
    }
    
    return result.count;
  }

  /**
   * Get notification count for a user
   */
  async getNotificationCount(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<number> {
    const cacheKey = unreadOnly 
      ? `${this.cacheKeyPrefix}count:user:${userId}:unread`
      : `${this.cacheKeyPrefix}count:user:${userId}:all`;
      
    if (this.cacheEnabled) {
      const cachedCount = await this.getFromCache<number>(cacheKey);
      if (cachedCount !== null) {
        return cachedCount;
      }
    }
    
    const where: Prisma.NotificationWhereInput = {
      userId,
      status: 'sent'
    };
    
    if (unreadOnly) {
      where.read = false;
    }
    
    const count = await this.count(where);
    
    if (this.cacheEnabled) {
      await this.setInCache(cacheKey, count, 30); // Cache for 30 seconds
    }
    
    return count;
  }

  /**
   * Update notification status in batch
   */
  async updateStatus(
    notificationIds: string[],
    status: NotificationStatus
  ): Promise<number> {
    const now = new Date();
    
    const data: any = {
      status,
      updatedAt: now
    };
    
    // If status is sent, update sentAt
    if (status === 'sent') {
      data.sentAt = now;
    }
    
    const result = await this.prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        }
      },
      data
    });
    
    // Invalidate cache for these notifications
    if (this.cacheEnabled && result.count > 0) {
      for (const id of notificationIds) {
        await this.invalidateCache(id);
      }
    }
    
    return result.count;
  }

  /**
   * Find notifications to be sent (scheduled)
   */
  async findScheduledNotifications(limit: number = 100): Promise<Notification[]> {
    const now = new Date();
    
    return this.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now
        }
      },
      orderBy: [
        { priority: 'desc' },
        { scheduledFor: 'asc' }
      ],
      take: limit
    });
  }

  /**
   * Advanced notification search with filtering, sorting and pagination
   */
  async searchNotifications(
    options: NotificationSearchOptions
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { 
      userId,
      channel,
      status,
      priority,
      read,
      startDate,
      endDate,
      relatedEntityType,
      relatedEntityId,
      sortBy = 'createdAt',
      sortDirection = 'desc',
      page = 1,
      pageSize = 20
    } = options;

    // Build where conditions
    const where: Prisma.NotificationWhereInput = {};

    // Add filters
    if (userId) {
      where.userId = userId;
    }
    
    if (channel) {
      where.channel = channel;
    }
    
    if (status && status.length > 0) {
      where.status = { in: status };
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (read !== undefined) {
      where.read = read;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }
    
    if (relatedEntityType) {
      where.relatedEntityType = relatedEntityType;
    }
    
    if (relatedEntityId) {
      where.relatedEntityId = relatedEntityId;
    }

    // Build sort options
    let orderBy: Prisma.NotificationOrderByWithRelationInput = {};
    
    switch (sortBy) {
      case 'priority':
        orderBy.priority = sortDirection;
        break;
      case 'sentAt':
        orderBy.sentAt = sortDirection;
        break;
      case 'readAt':
        orderBy.readAt = sortDirection;
        break;
      default:
        orderBy.createdAt = sortDirection;
    }

    // Get total count
    const total = await this.count(where);

    // Get paginated results
    const notifications = await this.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { notifications, total };
  }
}
