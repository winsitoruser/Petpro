/**
 * Notification Database Service
 * 
 * Manages user notifications, notification preferences, and templates.
 */
import { PrismaClient } from '@prisma/client';
import BaseService from './baseService';

// Using any types to work around Prisma schema mismatches
type Notification = any;
type NotificationPreference = any;
type NotificationTemplate = any;

export default class NotificationService extends BaseService<Notification> {
  constructor() {
    super('notification');
    this.searchFields = ['title', 'content'];
    this.defaultInclude = {
      user: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
    };
  }

  /**
   * Create a notification for a user
   */
  async createNotification(
    data: {
      userId: string;
      title: string;
      content: string;
      type: string;
      relatedEntityId?: string;
      relatedEntityType?: string;
      metadata?: Record<string, any>;
      deliveryChannels?: string[];
    }
  ): Promise<Notification> {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      // Check user notification preferences
      const preferences = await tx.notificationPreference.findFirst({
        where: {
          userId: data.userId,
          type: data.type,
        },
      });
      
      // If user has opted out, store in metadata
      const isSuppressed = preferences?.enabled === false;
      
      // Create the notification
      const notification = await tx.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          content: data.content,
          type: data.type,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          isRead: false,
          metadata: {
            ...data.metadata || {},
            isSuppressed,
            deliveryChannels: data.deliveryChannels || ['in_app']
          },
        },
        include: this.defaultInclude,
      });
      
      return notification;
    });
  }

  /**
   * Batch create notifications for multiple users
   */
  async batchCreateNotifications(
    data: {
      userIds: string[];
      title: string;
      content: string;
      type: string;
      relatedEntityId?: string;
      relatedEntityType?: string;
      metadata?: Record<string, any>;
      deliveryChannels?: string[];
    }
  ): Promise<{ count: number }> {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      // Get all user preferences for this notification type
      const preferences = await tx.notificationPreference.findMany({
        where: {
          userId: {
            in: data.userIds,
          },
          type: data.type,
        },
      });
      
      // Map of userId to preference
      const preferenceMap = new Map(
        preferences.map((pref: NotificationPreference) => [pref.userId, pref])
      );
      
      // Create notifications for each user
      const notifications = await tx.notification.createMany({
        data: data.userIds.map(userId => ({
          userId,
          title: data.title,
          content: data.content,
          type: data.type,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          isRead: false,
          metadata: {
            ...data.metadata || {},
            isSuppressed: (preferenceMap.get(userId) as NotificationPreference | undefined)?.enabled === false,
            deliveryChannels: data.deliveryChannels || ['in_app']
          },
        })),
      });
      
      return { count: notifications.count };
    });
  }

  /**
   * Batch create notifications for multiple users
   */
  async batchCreateNotifications(
    data: {
      userIds: string[];
      title: string;
      content: string;
      type: string;
      relatedEntityId?: string;
      relatedEntityType?: string;
      metadata?: Record<string, any>;
      deliveryChannels?: string[];
    }
  ): Promise<{ count: number }> {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      // Get all user preferences for this notification type
      const preferences = await tx.notificationPreference.findMany({
        where: {
          userId: {
            in: data.userIds,
          },
          type: data.type,
        },
      });
      
      // Map of userId to preference
      const preferenceMap = new Map(
        preferences.map((pref: NotificationPreference) => [pref.userId, pref])
      );
      
      // Create notifications for each user
      const notifications = await tx.notification.createMany({
        data: data.userIds.map(userId => ({
          userId,
          title: data.title,
          content: data.content,
          type: data.type,
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          isRead: false,
          metadata: {
            ...data.metadata || {},
            isSuppressed: (preferenceMap.get(userId) as NotificationPreference | undefined)?.enabled === false,
            deliveryChannels: data.deliveryChannels || ['in_app']
          },
        })),
        // Check if preference exists
        const existingPref = await tx.notificationPreference.findFirst({
          where: {
            userId,
            type: pref.type,
          },
        });
        
        if (existingPref) {
          const updated = await tx.notificationPreference.update({
            where: {
              id: existingPref.id,
            },
            data: {
              enabled: pref.enabled,
              channel: pref.channel || existingPref.channel,
            },
          });
          results.push(updated);
        } else {
          const created = await tx.notificationPreference.create({
            data: {
              userId,
              type: pref.type,
              enabled: pref.enabled,
              channel: pref.channel || 'in_app',
            },
          });
          results.push(created);
        }
      }
      
      return results;
    });
  }

  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
        metadata: {
          path: ['isSuppressed'],
          equals: false,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.skip || 0,
      take: options?.take || 10,
      include: this.defaultInclude,
    });
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(
    notificationIds: string[]
  ): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        isRead: true,
      },
    });
    
    return { count: result.count };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(
    userId: string
  ): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    
    return { count: result.count };
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreference[]> {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  /**
   * Create a notification template
   */
  async createNotificationTemplate(
    data: {
      code: string;
      title: string;
      content: string;
      type: string;
      deliveryChannels?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<NotificationTemplate> {
    return this.prisma.notificationTemplate.create({
      data: {
        name: data.code, // Map code to name in database schema
        type: data.type,
        description: data.content, // Map content to description in database schema
        emailSubject: data.title, // Map title to emailSubject in database schema
        emailBody: data.content,  // Map content to emailBody in database schema
        pushTitle: data.title,    // Map title to pushTitle in database schema
        pushBody: data.content,   // Map content to pushBody in database schema
        metadata: {
          ...data.metadata || {},
          deliveryChannels: data.deliveryChannels || ['in_app']
        },
        active: true,
      },
    });
  }

  /**
   * Get notification template by code
   */
  async getNotificationTemplate(
    code: string
  ): Promise<NotificationTemplate | null> {
    return this.prisma.notificationTemplate.findFirst({
      where: {
        name: code, // Map code to name in database schema
        active: true,
      },
    });
  }

  /**
   * Create notification from template
   */
  async createNotificationFromTemplate(
    data: {
      userId: string;
      templateCode: string;
      substitutions?: Record<string, string>;
      relatedEntityId?: string;
      relatedEntityType?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Notification> {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      const template = await tx.notificationTemplate.findFirst({
        where: { 
          name: data.templateCode,
          active: true 
        },
      });
      
      if (!template) {
        throw new Error(`Template not found: ${data.templateCode}`);
      }
      
      // Apply substitutions to title and content
      let title = '';
      let content = '';
      
      // Based on the channel, use the appropriate template field
      // For email
      if (template.emailSubject) title = template.emailSubject;
      if (template.emailBody) content = template.emailBody;
      // For push
      if (template.pushTitle) title = template.pushTitle;
      if (template.pushBody) content = template.pushBody;
      // Fallback
      if (!title) title = template.name || '';
      if (!content) content = template.description || '';
      
      if (data.substitutions) {
        for (const [key, value] of Object.entries(data.substitutions)) {
          const placeholder = `{{${key}}}`;
          title = title.replace(new RegExp(placeholder, 'g'), value);
          content = content.replace(new RegExp(placeholder, 'g'), value);
        }
      }
      
      // Check user notification preferences
      const preferences = await tx.notificationPreference.findFirst({
        where: {
          userId: data.userId,
          type: template.type, // Schema uses 'type' not 'notificationType'
        },
      });
      
      // If user has opted out, mark as suppressed
      const isSuppressed = preferences?.enabled === false; // Schema uses 'enabled' not 'isEnabled'
      
      // Create notification
      const notification = await tx.notification.create({
        data: {
          userId: data.userId,
          title,
          content,
          type: template.type,
          // Use appropriate fields for schema
          relatedEntityId: data.relatedEntityId,
          relatedEntityType: data.relatedEntityType,
          isRead: false,
          // Store isSuppressed, deliveryChannels and template reference in metadata
          metadata: {
            ...data.metadata || {},
            isSuppressed: isSuppressed,
            deliveryChannels: ['in_app'],
            templateId: template.id
          },
        },
        include: this.defaultInclude,
      });
      
      return notification;
    });
  }

  /**
   * Get notification statistics for a user
   */
  async getUserNotificationStats(
    userId: string
  ): Promise<{
    unreadCount: number;
    todayCount: number;
    thisWeekCount: number;
    notificationsByType: Record<string, number>;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const [
      unreadCount,
      todayCount,
      thisWeekCount,
      typeDistribution,
    ] = await Promise.all([
      // Get unread count
      this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
          metadata: {
            path: ['isSuppressed'],
            equals: false,
          },
        },
      }),
      
      // Get today's count
      this.prisma.notification.count({
        where: {
          userId,
          metadata: {
            path: ['isSuppressed'],
            equals: false,
          },
          createdAt: {
            gte: today,
          },
        },
      }),
      
      // Get this week's count
      this.prisma.notification.count({
        where: {
          userId,
          metadata: {
            path: ['isSuppressed'],
            equals: false,
          },
          createdAt: {
            gte: weekAgo,
          },
        },
      }),
      
      // Get type distribution
      this.prisma.notification.groupBy({
        by: ['type'],
        where: {
          userId,
          metadata: {
            path: ['isSuppressed'],
            equals: false,
          },
        },
        _count: true,
      }),
    ]);
    
    // Build notification type distribution
    const notificationsByType: Record<string, number> = {};
    typeDistribution.forEach((item: any) => {
      notificationsByType[item.type] = item._count;
    });
    
    return {
      unreadCount,
      todayCount,
      thisWeekCount,
      notificationsByType,
    };
  }

  /**
   * Upsert notification preferences for a user
   */
  async upsertNotificationPreferences(
    userId: string,
    preferences: Array<{
      notificationType: string;
      isEnabled: boolean;
      channels?: string[];
    }>
  ): Promise<NotificationPreference[]> {
    return this.prisma.$transaction(async (tx: PrismaClient) => {
      const results: NotificationPreference[] = [];
      
      for (const pref of preferences) {
        // Map field names from route parameters to DB schema
        const upsertData = {
          type: pref.notificationType,
            userId,
            type: pref.notificationType,
          },
        },
        update: {
          enabled: upsertData.enabled,
          channels: upsertData.channels,
        },
        create: {
          userId,
          type: upsertData.type,
          enabled: upsertData.enabled,
          channels: upsertData.channels,
        },
      });
      
      results.push(result);
    }
    
    return results;
  });
}
