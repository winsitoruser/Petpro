import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Define notification types
export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_STATUS_UPDATE = 'BOOKING_STATUS_UPDATE',
  NEW_MESSAGE = 'NEW_MESSAGE',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  SPECIAL_OFFER = 'SPECIAL_OFFER',
  APPOINTMENT_READY = 'APPOINTMENT_READY',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface NotificationPreferences {
  bookingUpdates: boolean;
  promotions: boolean;
  messages: boolean;
  reminders: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private notificationListener: any;
  private responseListener: any;
  private readonly NOTIFICATIONS_STORAGE_KEY = '@petpro_notifications';
  private readonly PREFERENCES_STORAGE_KEY = '@petpro_notification_preferences';

  private constructor() {
    // Initialize Expo Notifications
    this.configureNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Configure Expo notifications settings
   */
  private async configureNotifications() {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Add notification listeners
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );
    
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );
  }

  /**
   * Remove notification listeners when no longer needed
   */
  public cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Handle a notification when it's received
   */
  private async handleNotificationReceived(notification: Notifications.Notification) {
    const { data } = notification.request.content;
    
    // Save notification to local storage
    if (data && data.id) {
      const notificationData: NotificationData = {
        id: data.id as string,
        type: data.type as NotificationType || NotificationType.SYSTEM_NOTIFICATION,
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data: data as Record<string, any>,
        read: false,
        createdAt: new Date(),
      };

      await this.saveNotification(notificationData);
    }
  }

  /**
   * Handle user interaction with a notification
   */
  private async handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { data } = response.notification.request.content;
    
    // Mark as read
    if (data && data.id) {
      await this.markAsRead(data.id as string);
    }

    // Handle specific notification actions based on type
    // This would integrate with the app's navigation system
    // and other services as needed
  }

  /**
   * Register for push notifications
   */
  public async registerForPushNotifications(): Promise<string | null> {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A80F0',
        });
      }

      // Save token to backend
      await this.savePushToken(token);
      
      return token;
    } else {
      console.log('Must use physical device for Push Notifications');
      return null;
    }
  }

  /**
   * Send token to backend for storage
   */
  private async savePushToken(token: string): Promise<void> {
    try {
      // This would be an API call to your backend
      // await api.updatePushToken(token);
      console.log('Push token saved', token);
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  /**
   * Schedule a local notification
   */
  public async scheduleLocalNotification(
    title: string,
    body: string,
    data: Record<string, any> = {},
    trigger: Notifications.NotificationTriggerInput = null
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          ...data,
          id: data.id || `local-${new Date().getTime()}`,
        },
      },
      trigger,
    });

    return notificationId;
  }

  /**
   * Get all notifications from local storage
   */
  public async getNotifications(): Promise<NotificationData[]> {
    try {
      const notificationsJson = await AsyncStorage.getItem(this.NOTIFICATIONS_STORAGE_KEY);
      if (notificationsJson) {
        const notifications = JSON.parse(notificationsJson) as NotificationData[];
        // Convert string dates back to Date objects
        return notifications.map(notification => ({
          ...notification,
          createdAt: new Date(notification.createdAt),
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  public async getUnreadCount(): Promise<number> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  /**
   * Save a notification to local storage
   */
  private async saveNotification(notification: NotificationData): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      // Check if notification already exists
      const existingIndex = notifications.findIndex(n => n.id === notification.id);
      
      if (existingIndex >= 0) {
        notifications[existingIndex] = notification;
      } else {
        notifications.unshift(notification);
      }
      
      await AsyncStorage.setItem(this.NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  /**
   * Mark a notification as read
   */
  public async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      });
      
      await AsyncStorage.setItem(
        this.NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  public async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true,
      }));
      
      await AsyncStorage.setItem(
        this.NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(updatedNotifications)
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Delete a notification
   */
  public async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getNotifications();
      const filteredNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      
      await AsyncStorage.setItem(
        this.NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(filteredNotifications)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  /**
   * Clear all notifications
   */
  public async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.NOTIFICATIONS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Get notification preferences
   */
  public async getPreferences(): Promise<NotificationPreferences> {
    try {
      const prefsJson = await AsyncStorage.getItem(this.PREFERENCES_STORAGE_KEY);
      
      if (prefsJson) {
        return JSON.parse(prefsJson) as NotificationPreferences;
      }
      
      // Default preferences
      return {
        bookingUpdates: true,
        promotions: true,
        messages: true,
        reminders: true,
        pushEnabled: true,
        emailEnabled: true,
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        bookingUpdates: true,
        promotions: true,
        messages: true,
        reminders: true,
        pushEnabled: true,
        emailEnabled: true,
      };
    }
  }

  /**
   * Update notification preferences
   */
  public async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      const currentPrefs = await this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      
      await AsyncStorage.setItem(
        this.PREFERENCES_STORAGE_KEY,
        JSON.stringify(updatedPrefs)
      );
      
      // If push is disabled, we may want to inform the backend
      if (currentPrefs.pushEnabled && !updatedPrefs.pushEnabled) {
        // await api.disablePushNotifications();
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }
}

export default NotificationService.getInstance;
