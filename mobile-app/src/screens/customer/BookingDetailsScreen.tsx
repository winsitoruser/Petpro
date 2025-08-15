import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../contexts/SocketContext';

const BookingDetailsScreen = () => {
  const { t, formatDate, formatCurrency } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { booking: initialBooking } = route.params || {};
  const { subscribeToBookingUpdates, isConnected } = useSocket();
  
  const [booking, setBooking] = useState(initialBooking);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(false);

  // Fetch booking details - in a real app, this would call an API
  useEffect(() => {
    if (initialBooking?.id) {
      fetchBookingDetails(initialBooking.id);
    }
  }, [initialBooking]);

  // Handle real-time booking updates via WebSocket
  useEffect(() => {
    if (!booking?.id || !isConnected) return;
    
    console.log(`Setting up real-time updates for booking ${booking.id}`);
    
    // Subscribe to booking updates
    const unsubscribe = subscribeToBookingUpdates(booking.id, (data) => {
      console.log('Booking update received:', data);
      
      // Update booking with the new status
      if (data.status) {
        setBooking(prevBooking => {
          // Only update if the booking is the one we're viewing
          if (prevBooking.id !== data.bookingId) return prevBooking;
          
          // Create a new status update for the timeline
          const newStatusUpdate = {
            status: data.status,
            timestamp: data.updatedAt || new Date().toISOString(),
            message: data.message || `Booking status updated to ${data.status}`
          };
          
          // Add new status update to the timeline
          return {
            ...prevBooking,
            status: data.status,
            statusUpdates: [
              newStatusUpdate,
              ...prevBooking.statusUpdates
            ]
          };
        });
      }
    });
    
    // Cleanup subscription when component unmounts
    return () => {
      console.log(`Cleaning up real-time updates for booking ${booking.id}`);
      unsubscribe();
    };
  }, [booking?.id, isConnected, subscribeToBookingUpdates]);
  
  const fetchBookingDetails = async (bookingId) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would be:
      // const response = await api.getBookingDetails(bookingId);
      // setBooking(response.data);
      
      setBooking(initialBooking);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleCancelBooking = () => {
    Alert.alert(
      t('booking.cancelTitle'),
      t('booking.cancelConfirm'),
      [
        {
          text: t('common.no'),
          style: 'cancel'
        },
        {
          text: t('common.yes'),
          onPress: confirmCancelBooking,
          style: 'destructive'
        }
      ]
    );
  };
  
  const confirmCancelBooking = async () => {
    setCancellingBooking(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would be:
      // try {
      //   await api.cancelBooking(booking.id);
      //   const updatedBooking = { ...booking, status: 'cancelled' };
      //   setBooking(updatedBooking);
      // } catch (error) {
      //   Alert.alert(t('common.error'), t('booking.cancelError'));
      // }
      
      const updatedBooking = { 
        ...booking, 
        status: 'cancelled',
        statusUpdates: [
          ...booking.statusUpdates,
          { 
            status: 'cancelled', 
            timestamp: new Date().toISOString(), 
            message: 'Booking cancelled by customer'
          }
        ]
      };
      setBooking(updatedBooking);
      setCancellingBooking(false);
      
      Alert.alert(
        t('booking.cancelSuccess'),
        t('booking.cancelMessage'),
        [{ text: t('common.ok') }]
      );
    }, 1500);
  };
  
  const handleReschedule = () => {
    navigation.navigate('RescheduleBooking', { booking });
  };
  
  const handleContactVendor = () => {
    navigation.navigate('ChatConversation', {
      recipientId: booking.vendor.id,
      recipientName: booking.vendor.name,
      bookingId: booking.id
    });
  };
  
  const handleWriteReview = () => {
    navigation.navigate('WriteReview', { booking });
  };
  
  const handleViewVendor = () => {
    navigation.navigate('VendorDetails', { vendorId: booking.vendor.id });
  };
  
  const handleViewDirections = () => {
    // Would integrate with maps app
    Alert.alert(
      t('booking.directions'),
      t('booking.directionsMessage', { vendor: booking.vendor.name }),
      [{ text: t('common.ok') }]
    );
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50'; // Green
      case 'in_progress':
        return '#2196F3'; // Blue
      case 'completed':
        return '#673AB7'; // Purple
      case 'cancelled':
        return '#F44336'; // Red
      case 'pending':
        return '#FF9800'; // Orange
      default:
        return '#9E9E9E'; // Gray
    }
  };
  
  const getStatusText = (status) => {
    return t(`booking.status.${status}`);
  };
  
  const getStatusDescription = (status) => {
    return t(`booking.statusDescription.${status}`);
  };
  
  const formatStatusTimestamp = (timestamp) => {
    return formatDate(new Date(timestamp), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const canCancel = () => {
    return (booking?.status === 'confirmed' || booking?.status === 'pending') && 
           !cancellingBooking;
  };
  
  const canReschedule = () => {
    return booking?.status === 'confirmed' && !cancellingBooking;
  };
  
  const canReview = () => {
    return booking?.status === 'completed' && !booking?.hasReviewed;
  };
  
  if (isLoading || !booking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A80F0" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Socket Connection Indicator */}
      {booking?.id && (
        <View style={[styles.socketIndicator, { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }]}>
          <Text style={styles.socketIndicatorText}>
            {isConnected ? t('common.connected') : t('common.disconnected')}
          </Text>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('booking.details')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Ionicons 
              name={booking.status === 'cancelled' ? 'close' : 'checkmark'} 
              size={20} 
              color="#FFFFFF" 
            />
          </View>
          
          <Text style={styles.statusTitle}>
            {getStatusText(booking.status)}
          </Text>
          
          <Text style={styles.statusDescription}>
            {getStatusDescription(booking.status)}
          </Text>
        </View>
        
        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('booking.serviceDetails')}</Text>
          </View>
          
          <View style={styles.serviceCard}>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>{t('booking.serviceType')}</Text>
              <Text style={styles.serviceValue}>{booking.service.name}</Text>
            </View>
            
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>{t('booking.date')}</Text>
              <Text style={styles.serviceValue}>
                {formatDate(new Date(booking.date))}
              </Text>
            </View>
            
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>{t('booking.time')}</Text>
              <Text style={styles.serviceValue}>{booking.time}</Text>
            </View>
            
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>{t('booking.pet')}</Text>
              <Text style={styles.serviceValue}>
                {booking.pet.name} ({booking.pet.breed})
              </Text>
            </View>
            
            <View style={styles.serviceRow}>
              <Text style={styles.serviceLabel}>{t('booking.price')}</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(booking.totalPrice)}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.vendorCard}
          onPress={handleViewVendor}
        >
          <View style={styles.vendorImageContainer}>
            {booking.vendor.imageUrl ? (
              <Image 
                source={{ uri: booking.vendor.imageUrl }} 
                style={styles.vendorImage} 
              />
            ) : (
              <View style={styles.vendorImagePlaceholder}>
                <Text style={styles.vendorImagePlaceholderText}>
                  {booking.vendor.name[0]}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{booking.vendor.name}</Text>
            <Text style={styles.vendorLocation}>{booking.vendor.location}</Text>
          </View>
          
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleContactVendor}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#4A80F0" />
            <Text style={styles.actionButtonText}>{t('booking.contactVendor')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleViewDirections}
          >
            <Ionicons name="navigate-outline" size={20} color="#4A80F0" />
            <Text style={styles.actionButtonText}>{t('booking.getDirections')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statusTimeline}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('booking.bookingTimeline')}</Text>
          </View>
          
          {booking.statusUpdates.map((update, index) => (
            <View 
              key={index}
              style={styles.timelineItem}
            >
              <View style={styles.timelineDot} />
              {index !== booking.statusUpdates.length - 1 && <View style={styles.timelineLine} />}
              
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  {t(`booking.timelineStatus.${update.status}`)}
                </Text>
                <Text style={styles.timelineMessage}>{update.message}</Text>
                <Text style={styles.timelineTimestamp}>
                  {formatStatusTimestamp(update.timestamp)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        {canCancel() && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelBooking}
            disabled={cancellingBooking}
          >
            <Text style={styles.cancelButtonText}>
              {cancellingBooking ? t('booking.cancelling') : t('booking.cancelBooking')}
            </Text>
            {cancellingBooking && (
              <ActivityIndicator size="small" color="#F44336" style={{ marginLeft: 10 }} />
            )}
          </TouchableOpacity>
        )}
        
        {canReschedule() && (
          <TouchableOpacity
            style={styles.rescheduleButton}
            onPress={handleReschedule}
          >
            <Text style={styles.rescheduleButtonText}>{t('booking.reschedule')}</Text>
          </TouchableOpacity>
        )}
        
        {canReview() && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={handleWriteReview}
          >
            <Text style={styles.reviewButtonText}>{t('booking.leaveReview')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  socketIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 100,
    opacity: 0.9,
  },
  socketIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  statusBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  infoContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  serviceValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 16,
    color: '#4A80F0',
    fontWeight: 'bold',
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  vendorImageContainer: {
    marginRight: 16,
  },
  vendorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  vendorImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorImagePlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  vendorLocation: {
    fontSize: 14,
    color: '#666666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F5FF',
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#4A80F0',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  statusTimeline: {
    marginBottom: 100, // Extra space for footer
  },
  timelineItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4A80F0',
    marginTop: 4,
    marginRight: 16,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 26,
    top: 18,
    bottom: 0,
    width: 2,
    backgroundColor: '#E0E0E0',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  timelineMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: '#999999',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  rescheduleButton: {
    flex: 1,
    backgroundColor: '#4A80F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  rescheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingDetailsScreen;
