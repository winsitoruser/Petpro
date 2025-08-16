import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

const MAX_REVIEW_LENGTH = 500;

const WriteReviewScreen = () => {
  const { t, formatDate } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { booking } = route.params || {};
  const { user } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Helper function to handle star rating selection
  const handleRatingSelection = (selectedRating) => {
    setRating(selectedRating);
  };
  
  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert(
        t('review.ratingRequired'),
        t('review.pleaseSelectRating')
      );
      return;
    }
    
    setSubmitting(true);
    
    // In a real app, this would be an API call
    // try {
    //   await api.submitReview({
    //     bookingId: booking.id,
    //     vendorId: booking.vendor.id,
    //     serviceId: booking.service.id,
    //     rating: rating,
    //     review: reviewText,
    //     userId: user.id
    //   });
    // } catch (error) {
    //   console.error('Error submitting review:', error);
    //   Alert.alert(t('common.error'), t('review.submitError'));
    //   setSubmitting(false);
    //   return;
    // }
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      
      // Mark the booking as reviewed (in a real app, this would be handled by the backend)
      const updatedBooking = {
        ...booking,
        hasReviewed: true
      };
      
      Alert.alert(
        t('review.thankYou'),
        t('review.reviewSubmitted'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Navigate back to booking details with updated booking
              navigation.navigate('BookingDetails', { booking: updatedBooking });
            }
          }
        ]
      );
    }, 1500);
  };
  
  // Render the star rating selector
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingSelection(i)}
          style={styles.starContainer}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={40}
            color={i <= rating ? '#FFC107' : '#BBBBBB'}
          />
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.starsContainer}>
        {stars}
      </View>
    );
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('review.writeReview')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.serviceCard}>
          <Text style={styles.cardTitle}>{t('review.serviceDetails')}</Text>
          
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{booking.service.name}</Text>
            <Text style={styles.vendorName}>{booking.vendor.name}</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {formatDate(new Date(booking.date))} • {booking.time}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="paw-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {booking.pet.name} ({booking.pet.breed})
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.ratingSection}>
          <Text style={styles.ratingTitle}>{t('review.rateExperience')}</Text>
          {renderStars()}
          <Text style={styles.ratingDescription}>
            {rating > 0 ? t(`review.ratingDescription.${rating}`) : t('review.tapToRate')}
          </Text>
        </View>
        
        <View style={styles.reviewSection}>
          <Text style={styles.reviewTitle}>{t('review.shareExperience')}</Text>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.reviewInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder={t('review.reviewPlaceholder')}
              placeholderTextColor="#999"
              multiline
              maxLength={MAX_REVIEW_LENGTH}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {reviewText.length}/{MAX_REVIEW_LENGTH}
            </Text>
          </View>
          
          <Text style={styles.reviewTip}>
            {t('review.reviewTip')}
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            rating === 0 && styles.submitButtonDisabled
          ]}
          onPress={handleSubmitReview}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {t('review.submitReview')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  serviceInfo: {
    paddingTop: 8,
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
  ratingSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  starContainer: {
    padding: 5,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 100,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  textInputContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    height: 150,
  },
  characterCount: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#999',
  },
  reviewTip: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
  },
  submitButton: {
    backgroundColor: '#4A80F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0C4F8',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WriteReviewScreen;
