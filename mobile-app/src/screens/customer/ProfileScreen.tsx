import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const ProfileScreen = () => {
  const { t, formatDate } = useTranslation();
  const { user, updateUserProfile, isLoading } = useAuth();
  const navigation = useNavigation();
  
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleViewPets = () => {
    navigation.navigate('MyPets');
  };

  const handleViewBookingHistory = () => {
    navigation.navigate('BookingHistory');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };
  
  const handleHelp = () => {
    navigation.navigate('Help');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('common.permission'),
        t('profile.cameraRollPermission')
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.cancelled) {
      setProfileImage(result.uri);
      try {
        await updateUserProfile({ profileImage: result.uri });
      } catch (error) {
        Alert.alert(t('common.error'), t('profile.updateFailed'));
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A80F0" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.notificationButton} onPress={handleNotifications}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {user?.name ? user.name[0].toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        
        <View style={styles.memberInfo}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.memberText}>
            {t('profile.memberSince', { date: formatDate(new Date(user?.createdAt || new Date()), { year: 'numeric', month: 'long' }) })}
          </Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>{t('profile.editProfile')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.pets?.length || 0}</Text>
          <Text style={styles.statLabel}>{t('profile.pets')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.bookings?.length || 0}</Text>
          <Text style={styles.statLabel}>{t('profile.bookings')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user?.reviewsCount || 0}</Text>
          <Text style={styles.statLabel}>{t('profile.reviews')}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleViewPets}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="paw" size={22} color="#4A80F0" />
          </View>
          <Text style={styles.menuText}>{t('profile.myPets')}</Text>
          <Ionicons name="chevron-forward" size={22} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleViewBookingHistory}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="calendar" size={22} color="#4A80F0" />
          </View>
          <Text style={styles.menuText}>{t('profile.bookingHistory')}</Text>
          <Ionicons name="chevron-forward" size={22} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedVendors')}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="heart" size={22} color="#4A80F0" />
          </View>
          <Text style={styles.menuText}>{t('profile.savedVendors')}</Text>
          <Ionicons name="chevron-forward" size={22} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('PaymentMethods')}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="card" size={22} color="#4A80F0" />
          </View>
          <Text style={styles.menuText}>{t('profile.paymentMethods')}</Text>
          <Ionicons name="chevron-forward" size={22} color="#CCCCCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleHelp}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="help-circle" size={22} color="#4A80F0" />
          </View>
          <Text style={styles.menuText}>{t('profile.helpSupport')}</Text>
          <Ionicons name="chevron-forward" size={22} color="#CCCCCC" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.languageSection}>
        <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
        <LanguageSwitcher />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  settingsButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
    marginLeft: 15,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E1E1E1',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4A80F0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  memberText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#4A80F0',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E5E5E5',
  },
  menuSection: {
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  languageSection: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingBottom: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
});

export default ProfileScreen;
