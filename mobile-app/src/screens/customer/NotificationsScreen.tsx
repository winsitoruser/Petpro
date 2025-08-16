import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useTranslation } from '../../hooks/useTranslation';
import NotificationService, { 
  NotificationData,
  NotificationType 
} from '../../services/NotificationService';

const NotificationsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      const notificationsList = await NotificationService().getNotifications();
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };
  
  const handleMarkAsRead = async (notification: NotificationData) => {
    try {
      await NotificationService().markAsRead(notification.id);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(item => 
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
      
      // Handle navigation based on notification type
      handleNotificationNavigation(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService().markAllAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(item => ({ ...item, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const handleDelete = async (notificationId: string) => {
    try {
      await NotificationService().deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(item => item.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const handleClearAll = () => {
    Alert.alert(
      t('notifications.clearAllTitle'),
      t('notifications.clearAllConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService().clearAllNotifications();
              setNotifications([]);
            } catch (error) {
              console.error('Error clearing all notifications:', error);
            }
          },
        },
      ]
    );
  };
  
  const handleNotificationNavigation = (notification: NotificationData) => {
    const { type, data } = notification;
    
    switch (type) {
      case NotificationType.BOOKING_CONFIRMATION:
      case NotificationType.BOOKING_STATUS_UPDATE:
      case NotificationType.BOOKING_REMINDER:
        navigation.navigate('BookingDetails', { bookingId: data?.bookingId });
        break;
        
      case NotificationType.NEW_MESSAGE:
        navigation.navigate('ChatConversation', { 
          conversationId: data?.conversationId,
          recipientId: data?.senderId,
          recipientName: data?.senderName
        });
        break;
        
      case NotificationType.PAYMENT_CONFIRMATION:
        navigation.navigate('PaymentHistory', { paymentId: data?.paymentId });
        break;
        
      case NotificationType.SPECIAL_OFFER:
        navigation.navigate('SpecialOffer', { offerId: data?.offerId });
        break;
        
      case NotificationType.SERVICE_COMPLETED:
      case NotificationType.REVIEW_REQUEST:
        navigation.navigate('WriteReview', { 
          bookingId: data?.bookingId,
          vendorId: data?.vendorId,
          vendorName: data?.vendorName
        });
        break;
        
      default:
        // No navigation for system notifications or other types
        break;
    }
  };
  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.BOOKING_CONFIRMATION:
        return { name: 'calendar-check', color: '#4CAF50' };
      case NotificationType.BOOKING_REMINDER:
        return { name: 'alarm', color: '#FF9800' };
      case NotificationType.BOOKING_STATUS_UPDATE:
        return { name: 'refresh-circle', color: '#2196F3' };
      case NotificationType.NEW_MESSAGE:
        return { name: 'chatbubbles', color: '#9C27B0' };
      case NotificationType.PAYMENT_CONFIRMATION:
        return { name: 'card', color: '#795548' };
      case NotificationType.SPECIAL_OFFER:
        return { name: 'gift', color: '#F44336' };
      case NotificationType.APPOINTMENT_READY:
        return { name: 'checkmark-circle', color: '#4CAF50' };
      case NotificationType.SERVICE_COMPLETED:
        return { name: 'checkmark-done-circle', color: '#4CAF50' };
      case NotificationType.REVIEW_REQUEST:
        return { name: 'star', color: '#FFC107' };
      default:
        return { name: 'information-circle', color: '#607D8B' };
    }
  };
  
  const formatNotificationTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return t('notifications.minutesAgo', { count: diffMinutes || 1 });
    } else if (diffHours < 24) {
      return t('notifications.hoursAgo', { count: diffHours });
    } else if (diffDays < 7) {
      return t('notifications.daysAgo', { count: diffDays });
    } else {
      return format(date, 'MMM d');
    }
  };
  
  const renderNotificationItem = ({ item }: { item: NotificationData }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.notificationUnread
        ]}
        onPress={() => handleMarkAsRead(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notificationTime}>{formatNotificationTime(item.createdAt)}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#888" />
        </TouchableOpacity>
        
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>{t('notifications.noNotifications')}</Text>
      <Text style={styles.emptyStateText}>{t('notifications.emptyStateMessage')}</Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        
        {notifications.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.clearButtonText}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4A80F0" />
      ) : (
        <>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                colors={['#4A80F0']} 
              />
            }
          />
          
          {notifications.length > 0 && (
            <TouchableOpacity 
              style={styles.clearAllButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearAllButtonText}>{t('notifications.clearAll')}</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#4A80F0',
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 12,
    minHeight: '100%',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  notificationUnread: {
    backgroundColor: '#F0F5FF',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A80F0',
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  clearAllButton: {
    margin: 16,
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearAllButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
});

export default NotificationsScreen;
