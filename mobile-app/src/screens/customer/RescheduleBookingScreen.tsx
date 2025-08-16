import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { format, addDays } from 'date-fns';

import { useTranslation } from '../../hooks/useTranslation';

// Mock available time slots
const generateAvailableTimeSlots = (date) => {
  // In a real app, this would be fetched from an API based on vendor availability
  const slots = [];
  
  // Morning slots
  for (let hour = 9; hour <= 11; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  
  // Afternoon slots
  for (let hour = 13; hour <= 16; hour++) {
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  
  // Randomize some unavailable slots
  const unavailableSlotIndices = [
    Math.floor(Math.random() * slots.length),
    Math.floor(Math.random() * slots.length),
    Math.floor(Math.random() * slots.length)
  ];
  
  return slots.map((slot, index) => ({
    time: slot,
    available: !unavailableSlotIndices.includes(index)
  }));
};

const RescheduleBookingScreen = () => {
  const { t, formatDate } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { booking } = route.params || {};
  
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  const maxDate = format(addDays(today, 30), 'yyyy-MM-dd'); // Allow booking up to 30 days in advance
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState([]);
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  // When date is selected, generate time slots
  const handleDateSelect = (day) => {
    const selectedDate = day.dateString;
    setSelectedDate(selectedDate);
    setSelectedTime('');
    
    // In a real app, fetch available slots from API
    setTimeSlots(generateAvailableTimeSlots(selectedDate));
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };
  
  const handleRescheduleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert(
        t('booking.validationError'),
        t('booking.selectDateTimeError')
      );
      return;
    }
    
    setIsRescheduling(true);
    
    // In a real app, call API to reschedule booking
    setTimeout(() => {
      // try {
      //   await api.rescheduleBooking(booking.id, {
      //     date: selectedDate,
      //     time: selectedTime
      //   });
      //   
      //   // Success handling
      // } catch (error) {
      //   Alert.alert(t('common.error'), t('booking.rescheduleError'));
      //   setIsRescheduling(false);
      //   return;
      // }
      
      setIsRescheduling(false);
      
      Alert.alert(
        t('booking.rescheduleSuccess'),
        t('booking.rescheduleMessage', { 
          date: formatDate(new Date(selectedDate)),
          time: selectedTime 
        }),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Update booking and go back to booking details
              const updatedBooking = {
                ...booking,
                date: selectedDate,
                time: selectedTime,
                statusUpdates: [
                  ...booking.statusUpdates,
                  {
                    status: 'confirmed',
                    timestamp: new Date().toISOString(),
                    message: `Booking rescheduled to ${formatDate(new Date(selectedDate))} at ${selectedTime}`
                  }
                ]
              };
              
              navigation.navigate('BookingDetails', { booking: updatedBooking });
            }
          }
        ]
      );
    }, 1500);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('booking.reschedule')}</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('booking.currentAppointment')}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {formatDate(new Date(booking.date))} • {booking.time}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {booking.vendor.name}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="paw-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {booking.service.name} ({booking.pet.name})
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.selectNewDate')}</Text>
          
          <Calendar
            minDate={formattedToday}
            maxDate={maxDate}
            onDayPress={handleDateSelect}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#4A80F0' }
            }}
            theme={{
              todayTextColor: '#4A80F0',
              selectedDayBackgroundColor: '#4A80F0',
              selectedDayTextColor: '#ffffff',
              arrowColor: '#4A80F0',
              dotColor: '#4A80F0',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
            style={styles.calendar}
          />
        </View>
        
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('booking.selectTime')}</Text>
            
            <View style={styles.timeSlotContainer}>
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    !slot.available && styles.timeSlotUnavailable,
                    selectedTime === slot.time && styles.timeSlotSelected
                  ]}
                  onPress={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      !slot.available && styles.timeSlotTextUnavailable,
                      selectedTime === slot.time && styles.timeSlotTextSelected
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.noteContainer}>
          <Ionicons name="information-circle" size={20} color="#4A80F0" />
          <Text style={styles.noteText}>
            {t('booking.rescheduleNote')}
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.rescheduleButton,
            (!selectedDate || !selectedTime) && styles.rescheduleButtonDisabled
          ]}
          onPress={handleRescheduleBooking}
          disabled={!selectedDate || !selectedTime || isRescheduling}
        >
          {isRescheduling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.rescheduleButtonText}>
              {t('booking.confirmReschedule')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  scrollContainer: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 20,
    marginBottom: 10,
  },
  calendar: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  timeSlot: {
    width: '30%',
    padding: 12,
    margin: '1.66%',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  timeSlotSelected: {
    backgroundColor: '#4A80F0',
  },
  timeSlotUnavailable: {
    backgroundColor: '#F0F0F0',
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333333',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  timeSlotTextUnavailable: {
    color: '#999999',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F0FF',
    marginHorizontal: 20,
    marginBottom: 100,
    padding: 16,
    borderRadius: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#4A80F0',
    marginLeft: 10,
    lineHeight: 20,
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
  rescheduleButton: {
    backgroundColor: '#4A80F0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  rescheduleButtonDisabled: {
    backgroundColor: '#B0C4F8',
  },
  rescheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RescheduleBookingScreen;
