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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useTranslation } from '../../hooks/useTranslation';

// Mock data to be replaced with API calls
const MOCK_REVIEWS = [
  {
    id: 'review1',
    bookingId: 'booking1',
    vendorId: 'vendor1',
    userId: 'user1',
    rating: 5,
    review: 'The grooming service was excellent. My dog looks and smells amazing! The staff was very friendly and professional. Highly recommend for anyone looking for quality pet grooming.',
    userDisplayName: 'John D.',
    userAvatar: null,
    date: '2023-10-12T14:30:00Z',
    serviceType: 'Basic Grooming',
    helpfulCount: 3
  },
  {
    id: 'review2',
    bookingId: 'booking2',
    vendorId: 'vendor1',
    userId: 'user2',
    rating: 4,
    review: 'Good service overall. My cat was a bit anxious but they handled her well. The grooming was good but took longer than expected.',
    userDisplayName: 'Lisa K.',
    userAvatar: null,
    date: '2023-10-05T09:15:00Z',
    serviceType: 'Premium Grooming',
    helpfulCount: 1
  },
  {
    id: 'review3',
    bookingId: 'booking3',
    vendorId: 'vendor1',
    userId: 'user3',
    rating: 3,
    review: 'Average service. The grooming was okay but nothing special. The staff could be more attentive to the pet\'s needs.',
    userDisplayName: 'Michael R.',
    userAvatar: null,
    date: '2023-09-28T16:45:00Z',
    serviceType: 'Basic Grooming',
    helpfulCount: 0
  },
  {
    id: 'review4',
    bookingId: 'booking4',
    vendorId: 'vendor1',
    userId: 'user4',
    rating: 5,
    review: 'Absolutely fantastic! My dog has never looked better. The staff was very gentle and my dog seemed very comfortable throughout the whole process.',
    userDisplayName: 'Sarah T.',
    userAvatar: null,
    date: '2023-09-20T11:30:00Z',
    serviceType: 'Premium Grooming',
    helpfulCount: 5
  },
  {
    id: 'review5',
    bookingId: 'booking5',
    vendorId: 'vendor1',
    userId: 'user5',
    rating: 2,
    review: 'Not satisfied with the service. The grooming was rushed and my pet was still dirty in some spots. Would not recommend.',
    userDisplayName: 'David M.',
    userAvatar: null,
    date: '2023-09-15T13:20:00Z',
    serviceType: 'Basic Grooming',
    helpfulCount: 2
  }
];

const VendorReviewsScreen = () => {
  const { t, formatDate } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { vendorId, vendorName } = route.params || {};
  
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingStats, setRatingStats] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  });
  const [totalReviews, setTotalReviews] = useState(0);
  const [filter, setFilter] = useState('all'); // all, positive, negative, withPhotos
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    setIsLoading(true);
    
    // In a real app, this would be an API call
    // try {
    //   const response = await api.getVendorReviews(vendorId);
    //   setReviews(response.data.reviews);
    //   setAverageRating(response.data.averageRating);
    //   setRatingStats(response.data.ratingStats);
    //   setTotalReviews(response.data.totalReviews);
    // } catch (error) {
    //   console.error('Error fetching reviews:', error);
    // }
    
    // Simulate API call delay
    setTimeout(() => {
      const filteredReviews = MOCK_REVIEWS.filter(review => review.vendorId === vendorId);
      setReviews(filteredReviews);
      
      // Calculate average rating
      const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
      const avg = sum / filteredReviews.length || 0;
      setAverageRating(parseFloat(avg.toFixed(1)));
      
      // Calculate rating stats
      const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      filteredReviews.forEach(review => {
        if (stats[review.rating] !== undefined) {
          stats[review.rating]++;
        }
      });
      setRatingStats(stats);
      
      setTotalReviews(filteredReviews.length);
      setIsLoading(false);
      setRefreshing(false);
    }, 1000);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // In a real app, this would trigger a re-fetch with the filter
  };
  
  const handleMarkHelpful = (reviewId) => {
    // In a real app, this would call an API to mark as helpful
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpfulCount: review.helpfulCount + 1,
          markedHelpful: true
        };
      }
      return review;
    }));
  };
  
  const renderStars = (rating) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color={i <= rating ? '#FFC107' : '#BBBBBB'}
          style={{ marginRight: 2 }}
        />
      );
    }
    
    return (
      <View style={styles.starsContainer}>
        {stars}
      </View>
    );
  };
  
  const renderRatingSummary = () => {
    return (
      <View style={styles.ratingSummary}>
        <View style={styles.ratingHeader}>
          <View style={styles.averageRatingContainer}>
            <Text style={styles.averageRatingNumber}>{averageRating}</Text>
            <Text style={styles.totalReviewsText}>
              {t('review.outOf5', { count: totalReviews })}
            </Text>
          </View>
          
          <View style={styles.ratingBarContainer}>
            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.ratingBarRow}>
                <Text style={styles.ratingBarLabel}>{star}</Text>
                <View style={styles.ratingBar}>
                  <View 
                    style={[
                      styles.ratingBarFill, 
                      { 
                        width: `${(ratingStats[star] / totalReviews) * 100 || 0}%`,
                        backgroundColor: star >= 4 ? '#4CAF50' : star >= 3 ? '#FFC107' : '#F44336'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.ratingBarCount}>{ratingStats[star]}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              {t('review.filterAll')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'positive' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('positive')}
          >
            <Text style={[styles.filterButtonText, filter === 'positive' && styles.filterButtonTextActive]}>
              {t('review.filterPositive')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, filter === 'negative' && styles.filterButtonActive]}
            onPress={() => handleFilterChange('negative')}
          >
            <Text style={[styles.filterButtonText, filter === 'negative' && styles.filterButtonTextActive]}>
              {t('review.filterNegative')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderReviewItem = ({ item }) => {
    const reviewDate = formatDate(new Date(item.date), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUser}>
            <View style={styles.avatarContainer}>
              {item.userAvatar ? (
                <Image 
                  source={{ uri: item.userAvatar }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {item.userDisplayName.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            
            <View>
              <Text style={styles.userName}>{item.userDisplayName}</Text>
              <Text style={styles.reviewDate}>{reviewDate}</Text>
            </View>
          </View>
          
          <View>
            {renderStars(item.rating)}
          </View>
        </View>
        
        <Text style={styles.serviceType}>{item.serviceType}</Text>
        <Text style={styles.reviewText}>{item.review}</Text>
        
        <View style={styles.reviewFooter}>
          <TouchableOpacity 
            style={styles.helpfulButton}
            onPress={() => handleMarkHelpful(item.id)}
            disabled={item.markedHelpful}
          >
            <Ionicons 
              name="thumbs-up-outline" 
              size={16} 
              color={item.markedHelpful ? '#4A80F0' : '#666666'} 
            />
            <Text 
              style={[
                styles.helpfulText,
                item.markedHelpful && styles.helpfulTextActive
              ]}
            >
              {t('review.helpful')} ({item.helpfulCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-ellipses-outline" size={60} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>
        {t('review.noReviews')}
      </Text>
      <Text style={styles.emptyStateText}>
        {t('review.beFirstToReview')}
      </Text>
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
        <Text style={styles.headerTitle}>{t('review.reviews')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {isLoading && !refreshing ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4A80F0" />
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.reviewsList}
          ListHeaderComponent={renderRatingSummary}
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsList: {
    padding: 16,
    paddingTop: 0,
  },
  ratingSummary: {
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
  ratingHeader: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  averageRatingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    width: '25%',
  },
  averageRatingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  totalReviewsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ratingBarContainer: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'space-between',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: '#666',
    width: 15,
  },
  ratingBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 12,
    color: '#666',
    width: 20,
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#4A80F0',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: 12,
    color: '#666',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  reviewFooter: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 16,
  },
  helpfulText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666666',
  },
  helpfulTextActive: {
    color: '#4A80F0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 40,
  },
});

export default VendorReviewsScreen;
