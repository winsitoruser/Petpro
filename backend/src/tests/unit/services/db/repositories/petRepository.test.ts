import { PetRepository } from '../../../../../services/db/repositories/petRepository';
import { PrismaClient } from '@prisma/client';
import { PetSpecies } from '../../../../../types/petTypes';
import { MetricsCollector } from '../../../../../monitoring/metricsCollectorClass';
import { CacheManager } from '../../../../../services/cache/cacheManager';

// Add Jest types
import '@types/jest';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../../../../../monitoring/metricsCollectorClass');
jest.mock('../../../../../services/cache/cacheManager');

describe('PetRepository', () => {
  let petRepository: PetRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockMetricsCollector: jest.Mocked<MetricsCollector>;
  let mockCacheManager: jest.Mocked<CacheManager>;

  // Mock pet data
  const mockPet = {
    id: 'pet-123',
    userId: 'user-123',
    name: 'Buddy',
    species: PetSpecies.DOG,
    breed: 'Golden Retriever',
    birthDate: new Date('2020-01-01'),
    weight: 25,
    color: 'Golden',
    microchipId: 'CHIP123456',
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: 'Friendly dog'
  };

  const mockPets = [
    mockPet,
    {
      ...mockPet,
      id: 'pet-456',
      name: 'Max',
      breed: 'German Shepherd'
    }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up mocked dependencies
    mockPrisma = {
      pet: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn()
      },
      petVaccination: {
        create: jest.fn()
      },
      $transaction: jest.fn().mockImplementation((fn) => fn(mockPrisma))
    } as unknown as jest.Mocked<PrismaClient>;

    mockMetricsCollector = {
      incrementCounter: jest.fn(),
      decrementCounter: jest.fn(),
      observeHistogram: jest.fn(),
      startTimer: jest.fn().mockReturnValue(jest.fn())
    } as unknown as jest.Mocked<MetricsCollector>;

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delByPattern: jest.fn()
    } as unknown as jest.Mocked<CacheManager>;

    // Create repository instance with mocked dependencies
    petRepository = new PetRepository();
    
    // Set private properties using reflection
    Object.defineProperty(petRepository, 'prisma', { 
      value: mockPrisma,
      writable: true 
    });
    
    Object.defineProperty(petRepository, 'metricsCollector', { 
      value: mockMetricsCollector,
      writable: true 
    });
    
    Object.defineProperty(petRepository, 'cacheManager', { 
      value: mockCacheManager,
      writable: true 
    });
  });

  describe('findByUser', () => {
    it('should get pets from cache when cache hit', async () => {
      // Arrange
      const userId = 'user-123';
      mockCacheManager.get.mockResolvedValue(mockPets);

      // Act
      const result = await petRepository.findByUser(userId);

      // Assert
      expect(result).toEqual(mockPets);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`pets:user:${userId}`);
      expect(mockPrisma.pet.findMany).not.toHaveBeenCalled();
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_operations_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'findByUser' })
      );
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_hits_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'findByUser' })
      );
    });

    it('should query database and cache results when cache miss', async () => {
      // Arrange
      const userId = 'user-123';
      mockCacheManager.get.mockResolvedValue(null);
      mockPrisma.pet.findMany.mockResolvedValue(mockPets);

      // Act
      const result = await petRepository.findByUser(userId);

      // Assert
      expect(result).toEqual(mockPets);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`pets:user:${userId}`);
      expect(mockPrisma.pet.findMany).toHaveBeenCalledWith({
        where: { userId }
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `pets:user:${userId}`, 
        mockPets, 
        expect.any(Number)
      );
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_operations_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'findByUser' })
      );
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_misses_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'findByUser' })
      );
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_queries_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'findByUser', operation: 'findMany' })
      );
      expect(mockMetricsCollector.startTimer).toHaveBeenCalledWith(
        'repository_query_duration_seconds', 
        expect.objectContaining({ repository: 'PetRepository', method: 'findByUser', operation: 'findMany' })
      );
    });
  });

  describe('createWithHealthData', () => {
    it('should create pet with health data and invalidate cache', async () => {
      // Arrange
      const petData = {
        userId: 'user-123',
        name: 'Buddy',
        species: PetSpecies.DOG,
        breed: 'Golden Retriever',
        birthDate: new Date('2020-01-01'),
        weight: 25,
        color: 'Golden',
        microchipId: 'CHIP123456'
      };

      mockPrisma.pet.create.mockResolvedValue(mockPet);

      // Act
      const result = await petRepository.createWithHealthData(petData);

      // Assert
      expect(result).toEqual(mockPet);
      expect(mockPrisma.pet.create).toHaveBeenCalledWith({
        data: expect.objectContaining(petData),
        include: expect.any(Object)
      });
      expect(mockCacheManager.delByPattern).toHaveBeenCalledWith(`pets:user:${petData.userId}*`);
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_transactions_total',
        expect.objectContaining({ repository: 'PetRepository' })
      );
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_queries_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'createWithHealthData', operation: 'create' })
      );
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_invalidations_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'createWithHealthData' })
      );
      expect(mockMetricsCollector.startTimer).toHaveBeenCalledWith(
        'repository_transaction_duration_seconds',
        expect.objectContaining({ repository: 'PetRepository', method: 'createWithHealthData' })
      );
    });

    it('should handle errors and track them as metrics', async () => {
      // Arrange
      const petData = {
        userId: 'user-123',
        name: 'Buddy',
        species: PetSpecies.DOG,
        breed: 'Golden Retriever'
      };
      const error = new Error('Database error');
      mockPrisma.pet.create.mockRejectedValue(error);

      // Act & Assert
      await expect(petRepository.createWithHealthData(petData as any)).rejects.toThrow(error);
      
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_query_errors_total',
        expect.objectContaining({ 
          repository: 'PetRepository', 
          method: 'createWithHealthData',
          operation: 'create',
          error: 'Error'
        })
      );
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_transaction_errors_total',
        expect.objectContaining({ 
          repository: 'PetRepository', 
          method: 'createWithHealthData',
          error: 'Error'
        })
      );
    });
  });

  describe('getPetWithHealthProfile', () => {
    it('should get pet with health profile from cache when available', async () => {
      // Arrange
      const petId = 'pet-123';
      const petWithProfile = {
        ...mockPet,
        healthRecords: [],
        vaccinations: [],
        allergies: [],
        medications: [],
        appointments: []
      };
      mockCacheManager.get.mockResolvedValue(petWithProfile);

      // Act
      const result = await petRepository.getPetWithHealthProfile(petId);

      // Assert
      expect(result).toEqual(petWithProfile);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`pet:${petId}:healthProfile`);
      expect(mockPrisma.pet.findUnique).not.toHaveBeenCalled();
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_hits_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'getPetWithHealthProfile' })
      );
    });

    it('should query database and cache results when cache miss', async () => {
      // Arrange
      const petId = 'pet-123';
      const petWithProfile = {
        ...mockPet,
        healthRecords: [],
        vaccinations: [],
        allergies: [],
        medications: [],
        appointments: []
      };
      mockCacheManager.get.mockResolvedValue(null);
      mockPrisma.pet.findUnique.mockResolvedValue(petWithProfile);

      // Act
      const result = await petRepository.getPetWithHealthProfile(petId);

      // Assert
      expect(result).toEqual(petWithProfile);
      expect(mockCacheManager.get).toHaveBeenCalledWith(`pet:${petId}:healthProfile`);
      expect(mockPrisma.pet.findUnique).toHaveBeenCalledWith({
        where: { id: petId },
        include: expect.any(Object)
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `pet:${petId}:healthProfile`, 
        petWithProfile, 
        expect.any(Number)
      );
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_misses_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'getPetWithHealthProfile' })
      );
    });
  });

  describe('searchPets', () => {
    it('should search pets with filtering and track metrics', async () => {
      // Arrange
      const searchOptions = {
        userId: 'user-123',
        searchTerm: 'buddy',
        species: PetSpecies.DOG,
        page: 1,
        pageSize: 10
      };

      mockCacheManager.get.mockResolvedValue(null);
      mockPrisma.pet.findMany.mockResolvedValue(mockPets);
      mockPrisma.pet.count.mockResolvedValue(2);

      // Act
      const result = await petRepository.searchPets(searchOptions);

      // Assert
      expect(result).toEqual({ pets: mockPets, total: 2 });
      expect(mockPrisma.pet.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          userId: searchOptions.userId,
          species: searchOptions.species,
          OR: expect.any(Array)
        })
      }));
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_queries_total',
        expect.objectContaining({ repository: 'PetRepository', method: 'searchPets', operation: 'findMany' })
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('pets:search:'),
        { pets: mockPets, total: 2 },
        expect.any(Number)
      );
    });
  });
});
