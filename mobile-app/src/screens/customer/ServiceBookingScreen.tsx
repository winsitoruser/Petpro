import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

// Mock data - to be replaced with API calls
const MOCK_VENDOR = {
  id: '1',
  name: 'PetLuxe Grooming',
  rating: 4.8,
  reviewCount: 124,
  location: 'Shibuya, Tokyo',
  distance: 2.3,
  imageUrl: null,
  services: [
    { 
      id: '101', 
      name: 'Basic Grooming', 
      description: 'Bath, brush, nail trimming, ear cleaning', 
      price: 45.00, 
      duration: 60, 
      petTypes: ['Dog', 'Cat'],
      availability: {
        monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        friday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        saturday: ['10:00', '11:00', '12:00', '13:00'],
        sunday: [],
      }
    },
    { 
      id: '102', 
      name: 'Premium Grooming', 
      description: 'Basic grooming + styling, special shampoo, teeth cleaning', 
      price: 75.00, 
      duration: 90, 
      petTypes: ['Dog'],
      availability: {
        monday: ['09:00', '11:00', '14:00'],
        tuesday: ['09:00', '11:00', '14:00', '16:00'],
        wednesday: ['09:00', '11:00', '14:00'],
        thursday: ['09:00', '11:00', '14:00', '16:00'],
        friday: ['09:00', '11:00', '14:00'],
        saturday: ['10:00', '12:00'],
        sunday: [],
      }
    },
    { 
      id: '103', 
      name: 'Nail Trimming', 
      description: 'Professional nail trimming service', 
      price: 20.00, 
      duration: 20, 
      petTypes: ['Dog', 'Cat'],
      availability: {
        monday: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'],
        tuesday: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'],
        wednesday: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'],
        thursday: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'],
        friday: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'],
        saturday: ['10:00', '11:00', '12:00', '13:00', '14:00'],
        sunday: [],
      }
    }
  ]
};

const MOCK_PETS = [
  {
    id: '1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 28.5,
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: 2,
    weight: 4.2,
    imageUrl: null,
  }
];

const ServiceBookingScreen = () => {
  const { t, formatDate, formatCurrency } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  
  const [vendor] = useState(MOCK_VENDOR);
  const [pets] = useState(MOCK_PETS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);
  const [notes, setNotes] = useState('');
  
  // Booking stages
  const [currentStage, setCurrentStage] = useState(1);
  
  // Calendar marking
  const [markedDates, setMarkedDates] = useState({});
  
  // Available time slots
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  // Get weekday from date
  const getWeekday = (dateString) => {
    const date = new Date(dateString);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };
  
  // Set available time slots when date changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      const weekday = getWeekday(selectedDate);
      const slots = selectedService.availability[weekday] || [];
      setAvailableTimeSlots(slots);
      setSelectedTime(''); // Reset time when date changes
    }
  }, [selectedDate, selectedService]);
  
  // Generate marked dates
  useEffect(() => {
    if (selectedDate) {
      setMarkedDates({
        [selectedDate]: { selected: true, selectedColor: '#4A80F0' }
      });
    }
  }, [selectedDate]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setCurrentStage(2);
  };
  
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };
  
  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
  };
  
  const handleBookingConfirm = () => {
    if (!selectedService || !selectedDate || !selectedTime || !selectedPet) {
      Alert.alert(
        t('common.error'),
        t('booking.incompleteBooking')
      );
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        t('booking.success'),
        t('booking.confirmationMessage'),
        [
          { 
            text: t('common.ok'), 
            onPress: () => navigation.navigate('BookingConfirmation', {
              booking: {
                id: Math.random().toString(36).substring(7),
                service: selectedService,
                vendor: vendor,
                pet: selectedPet,
                date: selectedDate,
                time: selectedTime,
                notes: notes,
                status: 'confirmed',
                totalPrice: selectedService.price
              }
            }) 
          }
        ]
      );
    }, 2000);
  };
  
  const handleBackToPrevious = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    } else {
      navigation.goBack();
    }
  };
  
  const handleContinueToNext = () => {
    if (currentStage === 2 && (!selectedDate || !selectedTime)) {
      Alert.alert(
        t('common.error'),
        t('booking.selectDateTime')
      );
      return;
    }
    
    if (currentStage === 3 && !selectedPet) {
      Alert.alert(
        t('common.error'),
        t('booking.selectPet')
      );
      return;
    }
    
    if (currentStage < 4) {
      setCurrentStage(currentStage + 1);
    } else {
      handleBookingConfirm();
    }
  };
  
  const renderServiceItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() => handleServiceSelect(item)}
      >
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.servicePrice}>{formatCurrency(item.price)}</Text>
        </View>
        <Text style={styles.serviceDescription}>{item.description}</Text>
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetail}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.serviceDetailText}>{t('booking.duration', { minutes: item.duration })}</Text>
          </View>
          <View style={styles.serviceDetail}>
            <Ionicons name="paw-outline" size={14} color="#888" />
            <Text style={styles.serviceDetailText}>{item.petTypes.join(', ')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderTimeSlot = (time) => {
    const isSelected = time === selectedTime;
    
    return (
      <TouchableOpacity
        key={time}
        style={[
          styles.timeSlot,
          isSelected && styles.timeSlotSelected
        ]}
        onPress={() => handleTimeSelect(time)}
      >
        <Text style={[
          styles.timeSlotText,
          isSelected && styles.timeSlotTextSelected
        ]}>
          {time}
        </Text>
      </TouchableOpacity>
    );
  };
  
  const renderPetItem = ({ item }) => {
    const isSelected = selectedPet && selectedPet.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.petItem,
          isSelected && styles.petItemSelected
        ]}
        onPress={() => handlePetSelect(item)}
      >
        <View style={styles.petImage}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.petImageContent} />
          ) : (
            <Text style={styles.petImagePlaceholder}>{item.name[0]}</Text>
          )}
        </View>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
      </TouchableOpacity>
    );
  };

  // Render different stages of booking process
  const renderStage = () => {
    switch (currentStage) {
      case 1: // Service Selection
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>{t('booking.selectService')}</Text>
            <FlatList
              data={vendor.services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.serviceList}
            />
          </View>
        );
        
      case 2: // Date & Time Selection
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>{t('booking.selectDateTime')}</Text>
            <Text style={styles.selectedServiceName}>{selectedService?.name}</Text>
            
            <Text style={styles.sectionTitle}>{t('booking.selectDate')}</Text>
            <Calendar
              markedDates={markedDates}
              onDayPress={handleDateSelect}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                selectedDayBackgroundColor: '#4A80F0',
                todayTextColor: '#4A80F0',
                arrowColor: '#4A80F0',
                dotColor: '#4A80F0',
              }}
            />
            
            {selectedDate && (
              <View style={styles.timeSection}>
                <Text style={styles.sectionTitle}>{t('booking.selectTime')}</Text>
                {availableTimeSlots.length > 0 ? (
                  <View style={styles.timeSlotContainer}>
                    {availableTimeSlots.map(renderTimeSlot)}
                  </View>
                ) : (
                  <Text style={styles.noTimeSlots}>{t('booking.noTimeSlots')}</Text>
                )}
              </View>
            )}
          </View>
        );
        
      case 3: // Pet Selection
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>{t('booking.selectPet')}</Text>
            <Text style={styles.selectedServiceName}>
              {selectedService?.name} - {formatDate(new Date(selectedDate))} {selectedTime}
            </Text>
            
            <FlatList
              data={pets}
              renderItem={renderPetItem}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.petList}
              showsHorizontalScrollIndicator={false}
            />
            
            <TouchableOpacity 
              style={styles.addPetButton}
              onPress={() => navigation.navigate('AddEditPet', { returnToBooking: true })}
            >
              <Ionicons name="add-circle-outline" size={20} color="#4A80F0" />
              <Text style={styles.addPetText}>{t('booking.addNewPet')}</Text>
            </TouchableOpacity>
          </View>
        );
        
      case 4: // Review & Confirm
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>{t('booking.reviewBooking')}</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>{t('booking.bookingSummary')}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.service')}</Text>
                <Text style={styles.summaryValue}>{selectedService?.name}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.vendor')}</Text>
                <Text style={styles.summaryValue}>{vendor.name}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.pet')}</Text>
                <Text style={styles.summaryValue}>{selectedPet?.name} ({selectedPet?.breed})</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.date')}</Text>
                <Text style={styles.summaryValue}>{formatDate(new Date(selectedDate))}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.time')}</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('booking.price')}</Text>
                <Text style={styles.summaryPrice}>{formatCurrency(selectedService?.price)}</Text>
              </View>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToPrevious}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('booking.title')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.progressBar}>
        {[1, 2, 3, 4].map((stage) => (
          <View 
            key={stage}
            style={[
              styles.progressStep,
              stage <= currentStage ? styles.progressStepActive : {}
            ]}
          />
        ))}
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#4A80F0" />
        ) : (
          renderStage()
        )}
      </ScrollView>
      
      {currentStage > 1 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinueToNext}
            disabled={isLoading}
          >
            <Text style={styles.continueButtonText}>
              {currentStage < 4 ? t('common.continue') : t('booking.confirmBooking')}
            </Text>
            {isLoading && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 10 }} />}
          </TouchableOpacity>
        </View>
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
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#4A80F0',
  },
  scrollContainer: {
    flex: 1,
  },
  stageContainer: {
    padding: 20,
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  selectedServiceName: {
    fontSize: 16,
    color: '#4A80F0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
    color: '#333',
  },
  serviceList: {
    paddingBottom: 20,
  },
  serviceItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    marginTop: 8,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  serviceDetailText: {
    fontSize: 13,
    color: '#888',
    marginLeft: 4,
  },
  timeSection: {
    marginTop: 20,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeSlot: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    margin: 6,
  },
  timeSlotSelected: {
    backgroundColor: '#4A80F0',
  },
  timeSlotText: {
    color: '#333',
    fontSize: 14,
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  noTimeSlots: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  petList: {
    paddingVertical: 20,
  },
  petItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 16,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  petItemSelected: {
    borderColor: '#4A80F0',
    borderWidth: 2,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  petImageContent: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  petImagePlaceholder: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 12,
    color: '#888',
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  addPetText: {
    fontSize: 14,
    color: '#4A80F0',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryHeader: {
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A80F0',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    backgroundColor: '#4A80F0',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  }
});

export default ServiceBookingScreen;
