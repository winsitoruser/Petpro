import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../hooks/useTranslation';

// Mock data - to be replaced with API calls
const MOCK_PETS = [
  {
    id: '1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 28.5,
    imageUrl: null,
    lastCheckup: new Date('2025-07-10'),
    medicalConditions: ['Allergies'],
    vaccinations: [
      { name: 'Rabies', date: new Date('2025-02-15'), expiryDate: new Date('2026-02-15') },
      { name: 'DHPP', date: new Date('2025-01-10'), expiryDate: new Date('2026-01-10') }
    ]
  },
  {
    id: '2',
    name: 'Luna',
    species: 'Cat',
    breed: 'Siamese',
    age: 2,
    weight: 4.2,
    imageUrl: null,
    lastCheckup: new Date('2025-06-20'),
    medicalConditions: [],
    vaccinations: [
      { name: 'FVRCP', date: new Date('2025-03-05'), expiryDate: new Date('2026-03-05') }
    ]
  }
];

const MyPetsScreen = () => {
  const { t, formatDate } = useTranslation();
  const navigation = useNavigation();
  const [pets, setPets] = useState(MOCK_PETS);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pets - to be implemented with actual API
  useEffect(() => {
    // Replace with actual API call
    // fetchPets();
  }, []);

  const fetchPets = async () => {
    setIsLoading(true);
    try {
      // API call will go here
      // const response = await api.getPets();
      // setPets(response.data);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('pets.fetchError')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPet = () => {
    navigation.navigate('AddEditPet');
  };

  const handleEditPet = (pet) => {
    navigation.navigate('AddEditPet', { pet });
  };

  const handleDeletePet = (petId) => {
    Alert.alert(
      t('common.confirm'),
      t('pets.deleteConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.delete'),
          onPress: () => {
            // Delete pet logic - replace with API call
            setPets(pets.filter(pet => pet.id !== petId));
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleViewPetDetails = (pet) => {
    navigation.navigate('PetDetails', { pet });
  };

  const renderPetCard = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.petCard}
        onPress={() => handleViewPetDetails(item)}
      >
        <View style={styles.petHeader}>
          <View style={styles.petImageContainer}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.petImage} />
            ) : (
              <View style={styles.petImagePlaceholder}>
                <Text style={styles.petImagePlaceholderText}>{item.name[0]}</Text>
              </View>
            )}
            <View style={[styles.speciesBadge, { 
              backgroundColor: item.species === 'Dog' ? '#4A80F0' : 
                              item.species === 'Cat' ? '#F0784A' : '#7F4AF0'
            }]}>
              <Text style={styles.speciesBadgeText}>{item.species}</Text>
            </View>
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName}>{item.name}</Text>
            <Text style={styles.petBreed}>{item.breed}</Text>
            <Text style={styles.petAge}>{t('pets.ageValue', { age: item.age })}</Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditPet(item)}
            >
              <Ionicons name="pencil" size={18} color="#4A80F0" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeletePet(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#F0784A" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.healthSection}>
          <View style={styles.healthItem}>
            <Ionicons name="medical" size={16} color="#4A80F0" />
            <Text style={styles.healthText}>
              {item.lastCheckup 
                ? t('pets.lastCheckup', { date: formatDate(item.lastCheckup, { year: 'numeric', month: 'short', day: 'numeric' }) })
                : t('pets.noCheckup')}
            </Text>
          </View>
          
          <View style={styles.healthItem}>
            <Ionicons name="fitness" size={16} color="#4A80F0" />
            <Text style={styles.healthText}>
              {t('pets.weightValue', { weight: item.weight })}
            </Text>
          </View>
          
          <View style={styles.healthItem}>
            <Ionicons name="shield-checkmark" size={16} color="#4A80F0" />
            <Text style={styles.healthText}>
              {item.vaccinations && item.vaccinations.length > 0 
                ? t('pets.vaccinationCount', { count: item.vaccinations.length })
                : t('pets.noVaccinations')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>{t('pets.myPets')}</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4A80F0" />
      ) : (
        <>
          <FlatList
            data={pets}
            renderItem={renderPetCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.petList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="paw" size={60} color="#CCCCCC" />
                <Text style={styles.emptyStateText}>{t('pets.noPets')}</Text>
                <Text style={styles.emptyStateSubtext}>{t('pets.addPetPrompt')}</Text>
              </View>
            }
          />

          <TouchableOpacity 
            style={styles.addPetButton}
            onPress={handleAddPet}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addPetButtonText}>{t('pets.addPet')}</Text>
          </TouchableOpacity>
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
  petList: {
    padding: 16,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  petHeader: {
    flexDirection: 'row',
  },
  petImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  petImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E1E1E1',
  },
  petImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petImagePlaceholderText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#AAAAAA',
  },
  speciesBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  speciesBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  petInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  petAge: {
    fontSize: 12,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  healthSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  healthText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  addPetButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#4A80F0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#4A80F0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addPetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    marginTop: 20,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MyPetsScreen;
