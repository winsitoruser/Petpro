/**
 * Pet Repository
 * 
 * Repository for pet management operations with specialized methods
 * for pet-specific queries and transactions.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { PetSpecies } from '../../../types/petTypes.js';
import { Pet, PetHealthRecord, PetVaccination, PetAllergy, PetMedication } from '../../../types/prismaTypes';
import { EnhancedRepository, RepositoryOptions } from './base/enhancedRepository';
import { MetricsCollector } from '../../../monitoring/metricsCollectorClass';
import { CacheManager } from '../../cache/cacheManager';
import { logger } from '../../../utils/logger';

// Type for pet creation with health data
interface CreatePetWithHealthData {
  userId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: Date;
  weight?: number;
  color?: string;
  microchipId?: string;
  healthRecords?: Partial<PetHealthRecord>[];
  vaccinations?: Partial<Omit<PetVaccination, 'petId'>>[];
  allergies?: Partial<Omit<PetAllergy, 'petId'>>[];
  medications?: Partial<Omit<PetMedication, 'petId'>>[];
}

// Type for pet search options
interface PetSearchOptions {
  userId?: string;
  searchTerm?: string;
  species?: PetSpecies;
  minAge?: number;
  maxAge?: number;
  hasVaccinations?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Constants for model names
const PET_MODEL = 'Pet';

/**
 * Repository class for pet-related database operations
 * with metrics collection and cache integration.
 */
export class PetRepository extends EnhancedRepository<Pet> {
  // Model name for metrics and logging
  protected readonly modelName = PET_MODEL;

  /**
   * Creates a new PetRepository instance
   * 
   * @param prisma - Prisma client instance
   * @param metrics - Metrics collector instance
   * @param cache - Cache manager instance
   */
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly metrics: MetricsCollector,
    protected readonly cache: CacheManager
  ) {
    super('PetRepository', prisma, metrics, cache);
  }

  /**
   * Find pets by user ID
   *
   * @param userId - User ID to find pets for
   * @param options - Repository options
   * @returns Array of pets belonging to the user
   */
  async findByUser(userId: string, options: RepositoryOptions = {}): Promise<Pet[]> {
    const method = 'findByUser';
    
    return this.withCache(
      method,
      { userId },
      async () => {
        return this.executeQuery(
          'findMany',
          this.modelName,
          method,
          async () => {
            return await this.prisma.pet.findMany({
              where: { userId }
            });
          }
        );
      },
      options
    )
  }

  /**
   * Create a pet with health records, vaccinations, allergies, and medications in a single transaction
   * 
   * @param data - Pet data with health records, vaccinations, allergies, and medications
   * @returns The created pet with all associated health data
   */
  async createWithHealthData(data: CreatePetWithHealthData): Promise<Pet> {
    const method = 'createWithHealthData';
    
    return this.executeTransaction(async () => {
      // Create the pet with all related data
      const pet = await this.executeQuery(
        'create',
        this.modelName,
        method,
        async () => {
          return await this.prisma.pet.create({
            data: {
              userId: data.userId,
              name: data.name,
              species: data.species,
              breed: data.breed,
              birthDate: data.birthDate,
              weight: data.weight,
              color: data.color,
              microchipId: data.microchipId,
              // Create health records if provided
              healthRecords: data.healthRecords ? {
                create: data.healthRecords
              } : undefined,
              // Create vaccinations if provided
              vaccinations: data.vaccinations ? {
                create: data.vaccinations
              } : undefined,
              // Create allergies if provided
              allergies: data.allergies ? {
                create: data.allergies
              } : undefined,
              // Create medications if provided
              medications: data.medications ? {
                create: data.medications
              } : undefined
            },
            include: {
              healthRecords: true,
              vaccinations: true,
              allergies: true,
              medications: true
            }
          });
        }
      );
      
      logger.info('Created pet with health data', { 
        petId: pet.id,
        userId: pet.userId,
        name: pet.name,
        species: pet.species
      });
      
      // Invalidate user's pets cache
      await this.invalidateCache();
      
      return pet;
    });
  }

  /**
   * Get pet with complete health profile
   * 
   * @param petId - Pet ID to retrieve
   * @param options - Repository options
   * @returns Pet with all health data or null if not found
   */
  async getPetWithHealthProfile(petId: string, options: RepositoryOptions = {}): Promise<Pet | null> {
    const method = 'getPetWithHealthProfile';
    
    return this.withCache(
      method,
      { petId },
      async () => {
        return this.executeQuery(
          'findUnique',
          this.modelName,
          method,
          async () => {
            return await this.prisma.pet.findUnique({
              where: { id: petId },
              include: {
                healthRecords: {
                  orderBy: { 
                    recordDate: 'desc' 
                  }
                },
                vaccinations: {
                  orderBy: {
                    administeredDate: 'desc'
                  }
                },
                allergies: true,
                medications: {
                  where: {
                    active: true
                  },
                  orderBy: {
                    startDate: 'desc'
                  }
                }
              }
            });
          }
        );
      },
      options
    );
  }

  /**
   * Add vaccination record to pet
   * 
   * @param petId - ID of the pet to add vaccination to
   * @param vaccinationData - Vaccination data to add
   * @returns The created vaccination record
   */
  async addVaccination(petId: string, vaccinationData: Omit<PetVaccination, 'id' | 'petId'>): Promise<PetVaccination> {
    const method = 'addVaccination';
    
    return this.executeTransaction(async () => {
      const newVaccination = await this.executeQuery(
        'create',
        'PetVaccination',
        method,
        async () => {
          return await this.prisma.petVaccination.create({
            data: {
              petId,
              name: vaccinationData.name,
              administeredDate: vaccinationData.administeredDate,
              expirationDate: vaccinationData.expirationDate,
              administeredBy: vaccinationData.administeredBy, // Correct property
              lotNumber: vaccinationData.lotNumber,         // Correct property
              notes: vaccinationData.notes
            }
          });
        }
      );
      
      logger.info('Added vaccination to pet', { 
        petId,
        vaccinationId: newVaccination.id,
        name: newVaccination.name
      });
      
      // Invalidate cache after adding a vaccination
      await this.invalidateCache(`getPetWithHealthProfile:${newVaccination.petId}`);
      await this.invalidateCache(`getPetsWithVaccinationsDue`);
      
      return newVaccination;
    });
  }

  /**
   * Get pets with vaccinations due
   * 
   * @param userId - Optional user ID to filter by
   * @param daysThreshold - Number of days to check ahead for due vaccinations
   * @param options - Repository options
   * @returns Array of pets with their due vaccinations
   */
  async getPetsWithVaccinationsDue(
    userId?: string, 
    daysThreshold: number = 30,
    options: RepositoryOptions = {}
  ): Promise<Array<Pet & { vaccinations: PetVaccination[] }>> {
    const method = 'getPetsWithVaccinationsDue';
    
    // Override default cache TTL for this method
    const vaccineOptions = { ...options, cacheTtl: 60 }; // Short TTL for vaccination due data
    
    return this.withCache(
      method,
      { userId, daysThreshold },
      async () => {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
        
        const whereClause: any = {
          vaccinations: {
            some: {
              expirationDate: {
                lte: thresholdDate
              }
            }
          }
        };
        
        // Filter by user if provided
        if (userId) {
          whereClause.userId = userId;
        }
        
        return this.executeQuery(
          'findMany',
          this.modelName,
          method, 
          async () => {
            return await this.prisma.pet.findMany({
              where: whereClause,
              include: {
                vaccinations: {
                  where: {
                    expirationDate: {
                      lte: thresholdDate
                    }
                  }
                }
              }
            });
          }
        );
      },
      vaccineOptions
    );
  }

  /**
   * Advanced pet search with filtering, sorting and pagination
   * 
   * @param options - Search options including filters and pagination
   * @param repoOptions - Repository options
   * @returns Object containing pets array and total count
   */
  async searchPets(
    options: PetSearchOptions,
    repoOptions: RepositoryOptions = {}
  ): Promise<{ pets: Pet[]; total: number }> {
    const method = 'searchPets';
    const { 
      userId,
      searchTerm, 
      species, 
      minAge,
      maxAge,
      hasVaccinations,
      sortBy = 'name',
      sortDirection = 'asc',
      page = 1,
      pageSize = 10
    } = options;

    // Override default cache TTL for this method
    const searchOptions = { ...repoOptions, cacheTtl: 60 }; // Short TTL for search results
    
    return this.withCache(
      method,
      { ...options }, // Use all search options for cache key
      async () => {
        // Build where conditions
        const where: any = {};

        // Add filters
        if (userId) {
          where.userId = userId;
        }
        
        if (searchTerm) {
          where.OR = [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { breed: { contains: searchTerm, mode: 'insensitive' } },
            { color: { contains: searchTerm, mode: 'insensitive' } },
            { microchipId: { contains: searchTerm, mode: 'insensitive' } }
          ];
        }

        if (species) {
          where.species = species;
        }

        // Age filtering based on birthDate
        if (minAge !== undefined || maxAge !== undefined) {
          const now = new Date();
          
          if (minAge !== undefined) {
            const maxDate = new Date();
            maxDate.setFullYear(now.getFullYear() - minAge);
            where.birthDate = { ...(where.birthDate || {}), lte: maxDate };
          }
          
          if (maxAge !== undefined) {
            const minDate = new Date();
            minDate.setFullYear(now.getFullYear() - maxAge);
            where.birthDate = { ...(where.birthDate || {}), gte: minDate };
          }
        }

        // Vaccination filter
        if (hasVaccinations !== undefined) {
          where.vaccinations = hasVaccinations 
            ? { some: {} } // Has at least one vaccination
            : { none: {} }; // Has no vaccinations
        }

        // Build sort options
        let orderBy: any = {};
        
        switch (sortBy) {
          case 'birthDate':
            orderBy.birthDate = sortDirection;
            break;
          case 'species':
            orderBy.species = sortDirection;
            break;
          case 'weight':
            orderBy.weight = sortDirection;
            break;
          default:
            orderBy.name = sortDirection;
        }

        // Get total count - replaced with direct count query
        const total = await this.executeQuery(
          'count',
          this.modelName,
          `${method}:count`,
          async () => {
            return await this.prisma.pet.count({ where });
          }
        );

        // Get paginated results
        const pets = await this.executeQuery(
          'findMany',
          this.modelName,
          method,
          async () => {
            return await this.prisma.pet.findMany({
              where,
              orderBy,
              skip: (page - 1) * pageSize,
              take: pageSize,
              include: {
                vaccinations: {
                  take: 5,
                  orderBy: {
                    administeredDate: 'desc'
                  }
                }
              }
            });
          }
        );

        return { pets, total };
      },
      searchOptions
    );
  }
}
