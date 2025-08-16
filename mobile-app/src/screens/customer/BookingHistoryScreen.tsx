import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

// Mock data to be replaced with API calls
const MOCK_BOOKINGS = [
  {
    id: 'booking1',
    service: {
      id: '101',
      name: 'Basic Grooming',
      price: 45.00
    },
    vendor: {
      id: 'vendor1',
      name: 'PetLuxe Grooming',
      imageUrl: null,
      location: 'Shibuya, Tokyo'
    },
    pet: {
      id: 'pet1',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever'
    },
    date: '2023-11-15',
    time: '10:00',
    status: 'completed',
    statusUpdates: [
      { status: 'confirmed', timestamp: '2023-11-10T14:30:00Z', message: 'Booking confirmed' },
      { status: 'in_progress', timestamp: '2023-11-15T10:05:00Z', message: 'Service started' },
      { status: 'completed', timestamp: '2023-11-15T11:15:00Z', message: 'Service completed' }
    ],
    hasPaid: true,
    totalPrice: 45.00,
    hasReviewed: true
  },
  {
    id: 'booking2',
    service: {
      id: '102',
      name: 'Premium Grooming',
      price: 75.00
    },
    vendor: {
      id: 'vendor1',
      name: 'PetLuxe Grooming',
      imageUrl: null,
      location: 'Shibuya, Tokyo'
    },
    pet: {
      id: 'pet2',
      name: 'Luna',
      species: 'Cat',
      breed: 'Siamese'
    },
    date: '2023-11-25',
    time: '14:00',
    status: 'confirmed',
    statusUpdates: [
      { status: 'confirmed', timestamp: '2023-11-20T09:15:00Z', message: 'Booking confirmed' }
    ],
    hasPaid: true,
    totalPrice: 75.00,
    hasReviewed: false
  },
  {
    id: 'booking3',
    service: {
      id: '103',
      name: 'Health Checkup',
      price: 60.00
    },
    vendor: {
      id: 'vendor2',
      name: 'PetHealth Clinic',
      imageUrl: null,
      location: 'Shinjuku, Tokyo'
    },
    pet: {
      id: 'pet1',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever'
    },
    date: '2023-11-05',
    time: '11:30',
    status: 'cancelled',
    statusUpdates: [
      { status: 'confirmed', timestamp: '2023-10-30T16:45:00Z', message: 'Booking confirmed' },
      { status: 'cancelled', timestamp: '2023-11-03T08:20:00Z', message: 'Booking cancelled by customer' }
    ],
    hasPaid: false,
    totalPrice: 60.00,
    hasReviewed: false
  },
  {
    id: 'booking4',
    service: {
      id: '104',
      name: 'Pet Hotel - 3 days',
      price: 120.00
    },
    vendor: {
      id: 'vendor3',
      name: 'PetStay Luxury',
      imageUrl: null,
      location: 'Meguro, Tokyo'
    },
    pet: {
      id: 'pet1',
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever'
    },
    date: '2023-11-30',
    time: '09:00',
    status: 'pending',
    statusUpdates: [
      { status: 'pending', timestamp: '2023-11-22T10:10:00Z', message: 'Booking pending confirmation' }
    ],
    hasPaid: false,
    totalPrice: 120.00,
    hasReviewed: false
  }
];

const BookingHistoryScreen = () => {
  const { t, formatDate, formatCurrency } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [filteredBookings, setFilteredBookings] = useState(MOCK_BOOKINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  useEffect(() => {
    filterBookings(activeFilter);
  }, [bookings, activeFilter]);
  
  const fetchBookings = async () => {
    setIsLoading(true);
    
    // Replace with actual API call
    // try {
    //   const response = await api.getBookings();
    //   setBookings(response.data);
    // } catch (error) {
    //   console.error('Error fetching bookings:', error);
    // }
    
    // Simulate API call delay
    setTimeout(() => {
      setBookings(MOCK_BOOKINGS);
      setIsLoading(false);
      setRefreshing(false);
    }, 1000);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };
  
  const filterBookings = (filter) => {
    switch (filter) {
      case 'upcoming':
        setFilteredBookings(bookings.filter(booking => 
          booking.status === 'confirmed' || booking.status === 'pending'
        ));
        break;
      case 'active':
        setFilteredBookings(bookings.filter(booking => 
          booking.status === 'in_progress'
        ));
        break;
      case 'completed':
        setFilteredBookings(bookings.filter(booking => 
          booking.status === 'completed'
        ));
        break;
      case 'cancelled':
        setFilteredBookings(bookings.filter(booking => 
          booking.status === 'cancelled'
        ));
        break;
      default:
        setFilteredBookings(bookings);
    }
  };
  
  const handleViewBookingDetails = (booking) => {
    navigation.navigate('BookingDetails', { booking });
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
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'in_progress':
        return 'time';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      case 'pending':
        return 'hourglass';
      default:
        return 'help-circle';
    }
  };
  
  const getStatusText = (status) => {
    return t(`booking.status.${status}`);
  };
  
  const renderFilterChip = (filter, label) => {
    const isActive = activeFilter === filter;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isActive && styles.filterChipActive
        ]}
        onPress={() => setActiveFilter(filter)}
      >
        <Text
          style={[
            styles.filterChipText,
            isActive && styles.filterChipTextActive
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderBookingItem = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const formattedDate = formatDate(new Date(item.date));
    
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => handleViewBookingDetails(item)}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.service.name}</Text>
            <Text style={styles.vendorName}>{item.vendor.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {formattedDate} • {item.time}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="paw-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.pet.name} ({item.pet.breed})
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {item.vendor.location}
            </Text>
          </View>
        </View>
        
        <View style={styles.bookingFooter}>
          <Text style={styles.priceText}>
            {formatCurrency(item.totalPrice)}
          </Text>
          
          {item.status === 'completed' && !item.hasReviewed && (
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => navigation.navigate('WriteReview', { booking: item })}
            >
              <Text style={styles.reviewButtonText}>{t('booking.leaveReview')}</Text>
            </TouchableOpacity>
          )}
          
          {item.status === 'confirmed' && (
            <TouchableOpacity
              style={styles.trackButton}
              onPress={() => handleViewBookingDetails(item)}
            >
              <Text style={styles.trackButtonText}>{t('booking.trackStatus')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar" size={60} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>
        {t('bookingHistory.noBookings')}
      </Text>
      <Text style={styles.emptyStateText}>
        {activeFilter === 'all' 
          ? t('bookingHistory.emptyAllBookings')
          : t('bookingHistory.emptyFilteredBookings')}
      </Text>
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('ServiceExplore')}
      >
        <Text style={styles.exploreButtonText}>
          {t('bookingHistory.exploreServices')}
        </Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>{t('bookingHistory.title')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {renderFilterChip('all', t('bookingHistory.filterAll'))}
          {renderFilterChip('upcoming', t('bookingHistory.filterUpcoming'))}
          {renderFilterChip('active', t('bookingHistory.filterActive'))}
          {renderFilterChip('completed', t('bookingHistory.filterCompleted'))}
          {renderFilterChip('cancelled', t('bookingHistory.filterCancelled'))}
        </ScrollView>
      </View>
      
      {isLoading && !refreshing ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4A80F0" />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.bookingList}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={['#4A80F0']} 
            />
          }
        />
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#4A80F0',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingList: {
    padding: 16,
    paddingBottom: 80,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vendorName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#4A80F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: '#4A80F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookingHistoryScreen;
