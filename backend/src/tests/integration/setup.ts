/**
 * Integration Test Setup
 * 
 * Sets up a test database and Prisma client for integration testing
 */
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

// Test database URL with unique schema for parallel testing
const generateTestDatabaseUrl = () => {
  // Create a unique schema name for this test run
  const schema = `test_${randomUUID().replace(/-/g, '')}`;
  
  // Get the database URL from environment or use a default test URL
  const url = process.env.TEST_DATABASE_URL || 'postgresql://petpro_test:petpro_test@localhost:5432/petpro_test';
  
  // Add the schema search path to the URL
  return `${url}?schema=${schema}`;
};

// Create a fresh Prisma client for tests with the test schema
export const setupTestDatabase = async () => {
  // Generate a test database URL with unique schema
  const testDatabaseUrl = generateTestDatabaseUrl();
  
  // Set the DATABASE_URL environment variable for Prisma
  process.env.DATABASE_URL = testDatabaseUrl;
  
  try {
    // Run migrations to set up the schema
    execSync(`npx prisma migrate deploy`, {
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl
      }
    });
    
    // Create a new Prisma client with the test database URL
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: testDatabaseUrl,
        },
      },
    });
    
    // Connect to the database
    await prisma.$connect();
    
    return {
      prisma,
      databaseUrl: testDatabaseUrl,
    };
  } catch (error) {
    console.error('Failed to set up test database:', error);
    throw error;
  }
};

// Clean up test database after tests
export const teardownTestDatabase = async (prisma: PrismaClient) => {
  try {
    // Disconnect from the database
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
  }
};

// Seed the test database with test data
export const seedTestDatabase = async (prisma: PrismaClient) => {
  try {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'test_hash',
        userType: 'PET_OWNER',
        active: true,
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Test',
            lastName: 'User',
            displayName: 'TestUser'
          }
        }
      }
    });
    
    // Create test clinic
    const testClinic = await prisma.clinic.create({
      data: {
        userId: testUser.id,
        name: 'Test Clinic',
        description: 'A test clinic for integration testing',
        phoneNumber: '555-1234',
        email: 'clinic@example.com',
        latitude: 37.7749,
        longitude: -122.4194,
        address: {
          create: {
            userId: testUser.id,
            addressType: 'business',
            addressLine1: '123 Test St',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'Testland'
          }
        },
        services: {
          create: [
            {
              name: 'Checkup',
              description: 'Regular pet checkup',
              duration: 30,
              price: 50.00
            },
            {
              name: 'Vaccination',
              description: 'Pet vaccination service',
              duration: 15,
              price: 25.00
            }
          ]
        }
      }
    });
    
    // Create test pet
    const testPet = await prisma.pet.create({
      data: {
        userId: testUser.id,
        name: 'Fluffy',
        species: 'DOG',
        breed: 'Mixed',
        birthDate: new Date('2020-01-01'),
        weight: 15.5,
        color: 'Brown'
      }
    });
    
    // Create test notification
    const testNotification = await prisma.notification.create({
      data: {
        userId: testUser.id,
        title: 'Test Notification',
        content: 'This is a test notification',
        channel: 'APP',
        status: 'sent',
        priority: 'normal'
      }
    });
    
    return {
      testUser,
      testClinic,
      testPet,
      testNotification
    };
  } catch (error) {
    console.error('Failed to seed test database:', error);
    throw error;
  }
};

// Clear all data from the test database
export const clearTestDatabase = async (prisma: PrismaClient) => {
  try {
    // Delete all data in reverse order of dependencies
    await prisma.$transaction([
      prisma.notification.deleteMany(),
      prisma.petVaccination.deleteMany(),
      prisma.petHealthRecord.deleteMany(),
      prisma.petAllergy.deleteMany(),
      prisma.petMedication.deleteMany(),
      prisma.appointmentNote.deleteMany(),
      prisma.appointment.deleteMany(),
      prisma.pet.deleteMany(),
      prisma.clinicService.deleteMany(),
      prisma.clinicStaff.deleteMany(),
      prisma.clinic.deleteMany(),
      prisma.address.deleteMany(),
      prisma.userProfile.deleteMany(),
      prisma.user.deleteMany()
    ]);
  } catch (error) {
    console.error('Failed to clear test database:', error);
    throw error;
  }
};
