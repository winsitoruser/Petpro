/**
 * User Repository Unit Tests
 * 
 * Tests for UserRepository functionality with mocked Prisma client
 */
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient, User, UserProfile, UserType } from '@prisma/client';
import { UserRepository } from '../../services/db/repositories/userRepository';
import { prismaMock } from '../helpers/prismaMock';

// Mock the transaction helper
jest.mock('../../db/transaction', () => ({
  withTransaction: jest.fn((callback) => callback(prismaMock))
}));

// Mock the logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  
  beforeEach(() => {
    mockReset(prismaMock);
    userRepository = new UserRepository();
    
    // Inject the mock prisma client
    (userRepository as any).prisma = prismaMock;
  });

  describe('findByEmail', () => {
    it('should find a user by email without profile', async () => {
      // Arrange
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hash',
        userType: UserType.PET_OWNER,
        active: true,
        emailVerified: true,
        phoneVerified: false,
        lastLogin: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      prismaMock.user.findFirst.mockResolvedValue(mockUser);
      
      // Act
      const result = await userRepository.findByEmail('test@example.com');
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com', deletedAt: null },
        include: undefined
      });
    });
    
    it('should find a user by email with profile', async () => {
      // Arrange
      const mockUser: User & { profile: UserProfile } = {
        id: '123',
        email: 'test@example.com',
        passwordHash: 'hash',
        userType: UserType.PET_OWNER,
        active: true,
        emailVerified: true,
        phoneVerified: false,
        lastLogin: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          id: 'profile123',
          userId: '123',
          firstName: 'John',
          lastName: 'Doe',
          displayName: 'John D.',
          profileImage: null,
          bio: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      prismaMock.user.findFirst.mockResolvedValue(mockUser);
      
      // Act
      const result = await userRepository.findByEmail('test@example.com', true);
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com', deletedAt: null },
        include: { profile: true }
      });
    });
    
    it('should return null when user not found', async () => {
      // Arrange
      prismaMock.user.findFirst.mockResolvedValue(null);
      
      // Act
      const result = await userRepository.findByEmail('nonexistent@example.com');
      
      // Assert
      expect(result).toBeNull();
    });
  });
  
  describe('createWithProfile', () => {
    it('should create a user with profile', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        passwordHash: 'hash',
        userType: UserType.PET_OWNER,
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          displayName: 'Jane S.'
        }
      };
      
      const mockUser: User & { profile: UserProfile } = {
        id: '456',
        email: 'new@example.com',
        passwordHash: 'hash',
        userType: UserType.PET_OWNER,
        active: true,
        emailVerified: false,
        phoneVerified: false,
        lastLogin: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          id: 'profile456',
          userId: '456',
          firstName: 'Jane',
          lastName: 'Smith',
          displayName: 'Jane S.',
          profileImage: null,
          bio: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      prismaMock.user.create.mockResolvedValue(mockUser);
      
      // Act
      const result = await userRepository.createWithProfile(userData);
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          passwordHash: 'hash',
          userType: UserType.PET_OWNER,
          profile: {
            create: {
              firstName: 'Jane',
              lastName: 'Smith',
              displayName: 'Jane S.'
            }
          }
        },
        include: {
          profile: true
        }
      });
    });
  });
  
  describe('updateWithProfile', () => {
    it('should update user and profile data', async () => {
      // Arrange
      const userId = '123';
      const userData = { 
        email: 'updated@example.com'
      };
      const profileData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      const mockUser: User & { profile: UserProfile } = {
        id: '123',
        email: 'updated@example.com',
        passwordHash: 'hash',
        userType: UserType.PET_OWNER,
        active: true,
        emailVerified: true,
        phoneVerified: false,
        lastLogin: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          id: 'profile123',
          userId: '123',
          firstName: 'Updated',
          lastName: 'Name',
          displayName: 'John D.',
          profileImage: null,
          bio: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      prismaMock.user.update.mockResolvedValue(mockUser);
      
      // Act
      const result = await userRepository.updateWithProfile(userId, userData, profileData);
      
      // Assert
      expect(result).toEqual(mockUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          email: 'updated@example.com',
          profile: {
            upsert: {
              create: profileData,
              update: profileData
            }
          }
        },
        include: {
          profile: true
        }
      });
    });
  });
  
  describe('searchUsers', () => {
    it('should search users with filters and return paginated results', async () => {
      // Arrange
      const searchOptions = {
        searchTerm: 'test',
        userType: UserType.PET_OWNER,
        active: true,
        verified: true,
        page: 2,
        pageSize: 5
      };
      
      const mockUsers: User[] = [
        {
          id: '123',
          email: 'test1@example.com',
          passwordHash: 'hash',
          userType: UserType.PET_OWNER,
          active: true,
          emailVerified: true,
          phoneVerified: false,
          lastLogin: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '456',
          email: 'test2@example.com',
          passwordHash: 'hash',
          userType: UserType.PET_OWNER,
          active: true,
          emailVerified: true,
          phoneVerified: false,
          lastLogin: null,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      const mockCount = 15;
      
      prismaMock.user.findMany.mockResolvedValue(mockUsers);
      prismaMock.user.count.mockResolvedValue(mockCount);
      
      // Act
      const result = await userRepository.searchUsers(searchOptions);
      
      // Assert
      expect(result).toEqual({
        users: mockUsers,
        total: mockCount
      });
      
      expect(prismaMock.user.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
            { profile: { firstName: { contains: 'test', mode: 'insensitive' } } },
            { profile: { lastName: { contains: 'test', mode: 'insensitive' } } },
            { profile: { displayName: { contains: 'test', mode: 'insensitive' } } }
          ],
          userType: UserType.PET_OWNER,
          active: true,
          emailVerified: true
        }
      });
      
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
            { profile: { firstName: { contains: 'test', mode: 'insensitive' } } },
            { profile: { lastName: { contains: 'test', mode: 'insensitive' } } },
            { profile: { displayName: { contains: 'test', mode: 'insensitive' } } }
          ],
          userType: UserType.PET_OWNER,
          active: true,
          emailVerified: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: 5,
        take: 5,
        include: {
          profile: true
        }
      });
    });
  });
});
