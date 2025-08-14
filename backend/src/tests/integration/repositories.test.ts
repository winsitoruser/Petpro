/**
 * Repository Integration Tests
 * 
 * Tests repository implementations against a real test database
 */
import { PrismaClient } from '@prisma/client';
import {
  setupTestDatabase,
  teardownTestDatabase,
  seedTestDatabase,
  clearTestDatabase
} from './setup';
import { UserRepository } from '../../services/db/repositories/userRepository';
import { PetRepository } from '../../services/db/repositories/petRepository';
import { ClinicRepository } from '../../services/db/repositories/clinicRepository';
import { NotificationRepository } from '../../services/db/repositories/notificationRepository';

describe('Repository Integration Tests', () => {
  let prisma: PrismaClient;
  let userRepository: UserRepository;
  let petRepository: PetRepository;
  let clinicRepository: ClinicRepository;
  let notificationRepository: NotificationRepository;
  let testData: any;

  // Set up test database before all tests
  beforeAll(async () => {
    const testDb = await setupTestDatabase();
    prisma = testDb.prisma;
    
    // Initialize repositories with test prisma instance
    userRepository = new UserRepository();
    (userRepository as any).prisma = prisma;
    
    petRepository = new PetRepository();
    (petRepository as any).prisma = prisma;
    
    clinicRepository = new ClinicRepository();
    (clinicRepository as any).prisma = prisma;
    
    notificationRepository = new NotificationRepository();
    (notificationRepository as any).prisma = prisma;
    
    // Seed database with test data
    testData = await seedTestDatabase(prisma);
  }, 30000); // Allow 30 seconds for database setup

  // Clean up test database after all tests
  afterAll(async () => {
    await clearTestDatabase(prisma);
    await teardownTestDatabase(prisma);
  });

  // Reset database between tests
  afterEach(async () => {
    // Optionally clear specific tables between tests if needed
  });

  // User Repository Tests
  describe('UserRepository', () => {
    test('findById should return a user', async () => {
      // Act
      const user = await userRepository.findById(testData.testUser.id);
      
      // Assert
      expect(user).toBeDefined();
      expect(user?.id).toBe(testData.testUser.id);
      expect(user?.email).toBe('test@example.com');
    });

    test('findByEmail should return a user', async () => {
      // Act
      const user = await userRepository.findByEmail('test@example.com');
      
      // Assert
      expect(user).toBeDefined();
      expect(user?.id).toBe(testData.testUser.id);
    });

    test('findByEmail with profile should include profile data', async () => {
      // Act
      const user = await userRepository.findByEmail('test@example.com', true);
      
      // Assert
      expect(user).toBeDefined();
      expect(user?.profile).toBeDefined();
      expect(user?.profile?.firstName).toBe('Test');
      expect(user?.profile?.lastName).toBe('User');
    });

    test('createWithProfile should create user with profile', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        passwordHash: 'hashed_password',
        userType: 'PET_OWNER' as const,
        profile: {
          firstName: 'New',
          lastName: 'User',
          displayName: 'NewUser'
        }
      };
      
      // Act
      const user = await userRepository.createWithProfile(userData);
      
      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.profile).toBeDefined();
      expect(user.profile.firstName).toBe('New');
      expect(user.profile.lastName).toBe('User');
      
      // Clean up
      await prisma.userProfile.delete({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    test('searchUsers should filter and paginate results', async () => {
      // Act
      const result = await userRepository.searchUsers({
        userType: 'PET_OWNER',
        page: 1,
        pageSize: 10
      });
      
      // Assert
      expect(result.users.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });
  });

  // Pet Repository Tests
  describe('PetRepository', () => {
    test('findByUser should return pets for a user', async () => {
      // Act
      const pets = await petRepository.findByUser(testData.testUser.id);
      
      // Assert
      expect(pets).toBeDefined();
      expect(pets.length).toBeGreaterThan(0);
      expect(pets[0].userId).toBe(testData.testUser.id);
    });

    test('getPetWithHealthProfile should return pet with health data', async () => {
      // Act
      const pet = await petRepository.getPetWithHealthProfile(testData.testPet.id);
      
      // Assert
      expect(pet).toBeDefined();
      expect(pet?.id).toBe(testData.testPet.id);
      expect(pet?.healthRecords).toBeDefined();
      expect(pet?.vaccinations).toBeDefined();
    });

    test('createWithHealthData should create a pet with health records', async () => {
      // Arrange
      const petData = {
        userId: testData.testUser.id,
        name: 'Whiskers',
        species: 'CAT' as const,
        breed: 'Tabby',
        birthDate: new Date('2021-03-15'),
        weight: 4.2,
        color: 'Orange',
        vaccinations: [
          {
            name: 'Rabies',
            administeredDate: new Date(),
            expirationDate: new Date(Date.now() + 31536000000), // 1 year from now
            provider: 'Test Clinic'
          }
        ]
      };
      
      // Act
      const pet = await petRepository.createWithHealthData(petData);
      
      // Assert
      expect(pet).toBeDefined();
      expect(pet.name).toBe('Whiskers');
      expect(pet.vaccinations).toBeDefined();
      expect(pet.vaccinations.length).toBe(1);
      expect(pet.vaccinations[0].name).toBe('Rabies');
      
      // Clean up
      await prisma.petVaccination.deleteMany({ where: { petId: pet.id } });
      await prisma.pet.delete({ where: { id: pet.id } });
    });
  });

  // Clinic Repository Tests
  describe('ClinicRepository', () => {
    test('getClinicWithDetails should return clinic with related entities', async () => {
      // Act
      const clinic = await clinicRepository.getClinicWithDetails(testData.testClinic.id);
      
      // Assert
      expect(clinic).toBeDefined();
      expect(clinic?.id).toBe(testData.testClinic.id);
      expect(clinic?.name).toBe('Test Clinic');
      expect(clinic?.services).toBeDefined();
      expect(clinic?.services.length).toBe(2);
      expect(clinic?.address).toBeDefined();
    });

    test('findByOwner should return clinics owned by a user', async () => {
      // Act
      const clinics = await clinicRepository.findByOwner(testData.testUser.id);
      
      // Assert
      expect(clinics).toBeDefined();
      expect(clinics.length).toBeGreaterThan(0);
      expect(clinics[0].userId).toBe(testData.testUser.id);
    });

    test('findNearby should return clinics in geographical proximity', async () => {
      // Arrange
      const latitude = 37.7749;
      const longitude = -122.4194;
      const radiusKm = 100;
      
      // Act
      const clinics = await clinicRepository.findNearby(latitude, longitude, radiusKm);
      
      // Assert
      expect(clinics).toBeDefined();
      expect(clinics.length).toBeGreaterThan(0);
    });
  });

  // Notification Repository Tests
  describe('NotificationRepository', () => {
    test('findByUser should return notifications for a user', async () => {
      // Act
      const notifications = await notificationRepository.findByUser(testData.testUser.id);
      
      // Assert
      expect(notifications).toBeDefined();
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].userId).toBe(testData.testUser.id);
    });

    test('markAsRead should update read status of notifications', async () => {
      // Arrange
      const notification = await prisma.notification.create({
        data: {
          userId: testData.testUser.id,
          title: 'Test Read Status',
          content: 'This notification will be marked as read',
          channel: 'APP',
          status: 'sent',
          priority: 'normal',
          read: false
        }
      });
      
      // Act
      const updatedCount = await notificationRepository.markAsRead([notification.id]);
      const updatedNotification = await prisma.notification.findUnique({
        where: { id: notification.id }
      });
      
      // Assert
      expect(updatedCount).toBe(1);
      expect(updatedNotification).toBeDefined();
      expect(updatedNotification?.read).toBe(true);
      expect(updatedNotification?.readAt).toBeDefined();
      
      // Clean up
      await prisma.notification.delete({ where: { id: notification.id } });
    });

    test('getNotificationCount should return correct count', async () => {
      // Act
      const count = await notificationRepository.getNotificationCount(testData.testUser.id);
      
      // Assert
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
});
