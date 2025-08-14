/**
 * Clinic Repository
 * 
 * Repository for clinic management operations with specialized methods
 * for clinic-specific queries and transactions.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import type { Clinic, ClinicService, ClinicStaff, StaffAvailability, Appointment, Review } from '@prisma/client';
import { EnhancedRepository } from '../enhancedRepository';
import { withTransaction } from '../../../db/transaction';
import { logger } from '../../../utils/logger';
import { CacheManager } from '../../cache/cacheManager';
import { MetricsCollector } from '../../../monitoring/metricsCollectorClass';
import { PrismaClient } from '@prisma/client';

// Type for clinic creation with services and staff
interface CreateClinicData {
  userId: string;
  name: string;
  description?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  address?: {
    addressType: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  services?: Array<{
    name: string;
    description?: string;
    duration: number;
    price: number;
  }>;
  staff?: Array<{
    firstName: string;
    lastName: string;
    position: string;
    specialty?: string;
    bio?: string;
    availability?: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
  }>;
}

// Type for clinic search options
interface ClinicSearchOptions {
  searchTerm?: string;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
  services?: string[];
  rating?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export class ClinicRepository extends EnhancedRepository {
  // Model name for metrics and logging
  protected readonly modelName = 'Clinic';
  
  // Cache namespace prefix for clinic keys
  private readonly cachePrefix = 'petpro:clinic';
  
  // Default cache TTL values for different operations
  private readonly cacheTtls = {
    findById: 300, // 5 minutes for individual clinic
    findByOwner: 180, // 3 minutes for user's clinics
    getDetails: 240, // 4 minutes for clinic details
    search: 60, // 1 minute for search results
    availability: 30, // 30 seconds for availability data (more volatile)
    nearby: 120, // 2 minutes for location-based queries
  };
  
  /**
   * Creates a new ClinicRepository instance
   * 
   * @param prisma - Prisma client instance
   * @param metrics - Metrics collector instance
   * @param cache - Cache manager instance
   */
  constructor(
    protected readonly prisma: PrismaClient = new PrismaClient(),
    protected readonly metrics: MetricsCollector = new MetricsCollector(),
    protected readonly cache: CacheManager = new CacheManager()
  ) {
    super('ClinicRepository', prisma, metrics, cache);
  }

  /**
   * Find clinics by owner (user ID)
   * 
   * @param userId - ID of the user who owns the clinics
   * @returns Promise resolving to array of clinics
   */
  async findByOwner(userId: string): Promise<Clinic[]> {
    const method = 'findByOwner';
    const cacheKey = `${this.cachePrefix}:user:${userId}`;
    
    return this.cache.get<Clinic[]>(
      cacheKey,
      async () => {
        const result = await this.prisma.clinic.findMany({
          where: { userId },
          include: { address: true }
        });
        
        this.metrics.incrementCounter('repository_query_total', {
          repository: this.modelName,
          method,
          result_count: String(result.length)
        });
        
        return result;
      },
      {
        repository: this.modelName,
        method,
        cacheTtl: this.cacheTtls.findByOwner
      }
    );
  }

  /**
   * Create a clinic with address, services, and staff in a single transaction
   * 
   * @param data - Clinic data with address, services, and staff
   * @returns Promise resolving to the created clinic
   */
  async createWithDetails(data: CreateClinicData): Promise<Clinic> {
    const method = 'createWithDetails';
    
    const clinic = await withTransaction(async (tx) => {
      // Create address if provided
      let addressId: string | undefined;
      
      if (data.address) {
        const address = await tx.address.create({
          data: {
            userId: data.userId,
            ...data.address
          }
        });
        
        addressId = address.id;
      }
      
      // Track start time for metrics
      const startTime = Date.now();
      
      // Create the clinic
      const clinic = await tx.clinic.create({
        data: {
          userId: data.userId,
          name: data.name,
          description: data.description,
          phoneNumber: data.phoneNumber,
          email: data.email,
          website: data.website,
          addressId,
          
          // Create services if provided
          services: data.services ? {
            create: data.services
          } : undefined
        },
        include: {
          address: true,
          services: true
        }
      });
      
      // Create staff with availability if provided
      if (data.staff && data.staff.length > 0) {
        for (const staffData of data.staff) {
          const { availability, ...staffDetails } = staffData;
          
          const staff = await tx.clinicStaff.create({
            data: {
              clinicId: clinic.id,
              ...staffDetails
            }
          });
          
          // Create availability for staff if provided
          if (availability && availability.length > 0) {
            await tx.staffAvailability.createMany({
              data: availability.map(slot => ({
                clinicId: clinic.id,
                staffId: staff.id,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime
              }))
            });
          }
        }
      }
      
      const duration = Date.now() - startTime;
      this.metrics.observeHistogram('repository_operation_duration_seconds', {
        repository: this.modelName,
        operation: 'create',
        success: 'true'
      }, duration / 1000);
      
      logger.info('Created clinic with details', { 
        clinicId: clinic.id,
        name: clinic.name,
        servicesCount: data.services?.length || 0,
        staffCount: data.staff?.length || 0
      });
      
      // Return the clinic with all relations
      return tx.clinic.findUnique({
        where: { id: clinic.id },
        include: {
          address: true,
          services: true,
          staff: {
            include: {
              availability: true
            }
          }
        }
      }) as Promise<Clinic>;
    });
    
    // Invalidate any related caches
    await this.cache.delByPattern(`${this.cachePrefix}:user:${data.userId}*`, {
      repository: this.modelName,
      method
    });
    
    return clinic;
  }

  /**
   * Get clinic with complete details including address, services, staff and availability
   * 
   * @param clinicId - ID of the clinic to retrieve
   * @returns Promise resolving to clinic with all related details or null
   */
  async getClinicWithDetails(clinicId: string): Promise<Clinic | null> {
    const method = 'getClinicWithDetails';
    const cacheKey = `${this.cachePrefix}:${clinicId}:details`;
    
    return this.cache.get<Clinic | null>(
      cacheKey,
      async () => {
        const clinic = await this.prisma.clinic.findUnique({
          where: { id: clinicId },
          include: {
            address: true,
            services: true,
            staff: {
              include: {
                availability: true
              }
            },
            reviews: {
              take: 3,
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        });
        
        this.metrics.incrementCounter('repository_query_total', {
          repository: this.modelName,
          method,
          found: clinic ? 'true' : 'false'
        });
        
        return clinic;
      },
      {
        repository: this.modelName,
        method,
        cacheTtl: this.cacheTtls.getDetails
      }
    );
  }

  /**
   * Find clinics near a geographic location
   * 
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @param radiusKm - Search radius in kilometers
   * @param limit - Maximum number of results to return
   * @returns Promise resolving to array of nearby clinics
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    limit: number = 20
  ): Promise<Clinic[]> {
    const method = 'findNearby';
    // Round coordinates to 3 decimal places for better cache hit rate
    // ~100m precision which is reasonable for this use case
    const roundedLat = Math.round(latitude * 1000) / 1000;
    const roundedLng = Math.round(longitude * 1000) / 1000;
    const cacheKey = `${this.cachePrefix}:geo:${roundedLat}:${roundedLng}:${radiusKm}:${limit}`;
    
    return this.cache.get<Clinic[]>(
      cacheKey,
      async () => {
    // Earth's radius in km
    const earthRadius = 6371;
    
    // Find clinics within the specified radius using Haversine formula
    // This is a direct SQL query as Prisma doesn't have built-in geospatial queries
    const clinics = await this.prisma.$queryRaw<Clinic[]>`
      SELECT 
        c.*,
        ${earthRadius} * acos(
          cos(radians(${latitude})) * 
          cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * 
          sin(radians(c.latitude))
        ) AS distance
      FROM "Clinic" c
      WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL
      HAVING distance < ${radiusKm}
      ORDER BY distance
      LIMIT ${limit}
    `;
    
    this.metrics.incrementCounter('repository_query_total', {
      repository: this.modelName,
      method,
      result_count: String(clinics.length),
      geo_query: 'true'
    });
    
    return clinics;
  },
  {
    repository: this.modelName,
    method,
    cacheTtl: this.cacheTtls.nearby,
    priority: 'high' // Geo queries are important for user experience
  });
  }

  /**
   * Update clinic rating based on reviews
   * 
   * @param clinicId - ID of the clinic to update ratings for
   * @returns Promise resolving to the updated clinic
   */
  async updateRatings(clinicId: string): Promise<Clinic> {
    return withTransaction(async (tx) => {
      // Calculate average rating and count reviews
      const aggregateResult = await tx.review.aggregate({
        where: {
          targetType: 'clinic',
          targetId: clinicId
        },
        _avg: {
          rating: true
        },
        _count: {
          id: true
        }
      });
      
      // Update clinic with new rating data
      const clinic = await tx.clinic.update({
        where: { id: clinicId },
        data: {
          averageRating: aggregateResult._avg.rating || 0,
          totalReviews: aggregateResult._count.id || 0
        }
      });
      
      // Invalidate clinic-related caches
      await this.cache.delByPattern(`${this.cachePrefix}:${clinicId}*`, {
        repository: this.modelName,
        method: 'updateRatings'
      });
      
      return clinic;
    });
  }

  /**
   * Get clinic appointment availability for a date range
   * 
   * @param clinicId - ID of the clinic
   * @param startDate - Start date of the range
   * @param endDate - End date of the range
   * @param serviceId - Optional service ID to filter by
   * @returns Promise resolving to array of available slots by date
   */
  async getAvailabilityForDateRange(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    serviceId?: string
  ): Promise<Array<{date: Date, slots: Array<{staffId: string, startTime: Date, endTime: Date}>}>> {
    const method = 'getAvailabilityForDateRange';
    const formattedStart = startDate.toISOString().split('T')[0];
    const formattedEnd = endDate.toISOString().split('T')[0];
    const cacheKey = `${this.cachePrefix}:${clinicId}:availability:${formattedStart}:${formattedEnd}${serviceId ? `:${serviceId}` : ''}`;
    
    return this.cache.get(
      cacheKey,
      async () => {
    // Get clinic details with staff and availability
    const clinic = await this.findById(clinicId, {
      include: {
        staff: {
          include: {
            availability: true
          }
        },
        services: serviceId ? {
          where: { id: serviceId }
        } : true
      }
    });
    
    if (!clinic) {
      return [];
    }
    
    // Get existing appointments in date range to check against availability
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        appointmentDate: {
          gte: startDate,
          lte: endDate
        },
        status: {
          notIn: ['cancelled', 'no_show']
        }
      },
      select: {
        staffId: true,
        appointmentDate: true,
        startTime: true,
        endTime: true
      }
    });
    
    // Calculate available time slots based on staff availability and existing appointments
    const availableSlots: Array<{date: Date, slots: Array<{staffId: string, startTime: Date, endTime: Date}>}> = [];
    
    // Process each day in the date range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0-6 for Sunday-Saturday
      const slotsForDay: Array<{staffId: string, startTime: Date, endTime: Date}> = [];
      
      // Check each staff member's availability for this day
      for (const staff of clinic.staff || []) {
        // Find availability settings for this day of week
        const availability = staff.availability?.find(a => a.dayOfWeek === dayOfWeek);
        
        if (availability) {
          // Convert availability times to Date objects for this specific date
          const startTimeForDay = new Date(currentDate);
          const [startHours, startMinutes] = availability.startTime.split(':');
          startTimeForDay.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
          
          const endTimeForDay = new Date(currentDate);
          const [endHours, endMinutes] = availability.endTime.split(':');
          endTimeForDay.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);
          
          // Check against existing appointments for this staff and day
          const staffAppointments = existingAppointments.filter(appt => 
            appt.staffId === staff.id && 
            appt.appointmentDate.getDate() === currentDate.getDate() &&
            appt.appointmentDate.getMonth() === currentDate.getMonth() &&
            appt.appointmentDate.getFullYear() === currentDate.getFullYear()
          );
          
          // Create time slots (simplified - in reality would need to check against appointments)
          if (staffAppointments.length === 0) {
            // If no appointments, entire time block is available
            slotsForDay.push({
              staffId: staff.id,
              startTime: startTimeForDay,
              endTime: endTimeForDay
            });
          } else {
            // Add more complex logic here to find available time slots between appointments
            // This would require time slot generation based on service duration
          }
        }
      }
      
      if (slotsForDay.length > 0) {
        availableSlots.push({
          date: new Date(currentDate),
          slots: slotsForDay
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
      return availableSlots;
    },
    {
      repository: this.modelName,
      method,
      cacheTtl: this.cacheTtls.availability, // Short TTL as availability changes frequently
      priority: 'high' // Availability queries are critical for booking flow
    });
  }

  /**
   * Advanced clinic search with filtering, sorting and pagination
   * 
   * @param options - Search options including filters and pagination
   * @returns Promise resolving to object with clinics array and total count
   */
  async searchClinics(options: ClinicSearchOptions): Promise<{ clinics: Clinic[]; total: number }> {
    const method = 'searchClinics';
    
    // Create a deterministic cache key from the options
    const cacheKey = `${this.cachePrefix}:search:${this.createSearchCacheKey(options)}`;
    
    return this.cache.get<{clinics: Clinic[], total: number}>(
      cacheKey,
      async () => {
    const { 
      searchTerm,
      location,
      services,
      rating,
      sortBy = 'averageRating',
      sortDirection = 'desc',
      page = 1,
      pageSize = 10
    } = options;

    // Build where conditions
    const where: Prisma.ClinicWhereInput = {};

    // Add filters
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { address: { city: { contains: searchTerm, mode: 'insensitive' } } },
        { address: { state: { contains: searchTerm, mode: 'insensitive' } } }
      ];
    }

    if (services && services.length > 0) {
      where.services = {
        some: {
          name: {
            in: services
          }
        }
      };
    }

    if (rating !== undefined) {
      where.averageRating = { gte: rating };
    }

    // Handle geolocation filtering using raw SQL if location is provided
    if (location) {
      // We'll use a different approach for location-based searches
      const { latitude, longitude, radiusKm } = location;
      
      // Find clinics within radius first
      const nearbyClinics = await this.findNearby(latitude, longitude, radiusKm);
      const nearbyClinicIds = nearbyClinics.map(c => c.id);
      
      // Add to WHERE clause
      where.id = { in: nearbyClinicIds };
    }

    // Build sort options
    let orderBy: Prisma.ClinicOrderByWithRelationInput = {};
    
    switch (sortBy) {
      case 'name':
        orderBy.name = sortDirection;
        break;
      case 'rating':
        orderBy.averageRating = sortDirection;
        break;
      case 'reviews':
        orderBy.totalReviews = sortDirection;
        break;
      default:
        orderBy.averageRating = sortDirection;
    }

    // Get total count
    const total = await this.count(where);

    // Get paginated results
    const clinics = await this.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        address: true,
        services: true
      }
    });

      return { clinics, total };
    },
    {
      repository: this.modelName,
      method,
      cacheTtl: this.cacheTtls.search,
      priority: 'medium'
    });
  }
  
  /**
   * Creates a deterministic cache key from search options
   * 
   * @param options - Search options
   * @returns Deterministic string key for cache
   */
  private createSearchCacheKey(options: ClinicSearchOptions): string {
    const {
      searchTerm = '',
      location,
      services = [],
      rating,
      sortBy = 'averageRating',
      sortDirection = 'desc',
      page = 1,
      pageSize = 10
    } = options;
    
    // Create location part of key if present
    let locationKey = '';
    if (location) {
      const roundedLat = Math.round(location.latitude * 1000) / 1000;
      const roundedLng = Math.round(location.longitude * 1000) / 1000;
      locationKey = `loc:${roundedLat}:${roundedLng}:${location.radiusKm}`;
    }
    
    // Create services part of key if present
    const servicesKey = services.length > 0 ? `svc:${services.sort().join('-')}` : '';
    
    // Create rating part of key if present
    const ratingKey = rating !== undefined ? `r:${rating}` : '';
    
    // Create a deterministic key from all parameters
    return [
      `q:${searchTerm}`,
      locationKey,
      servicesKey,
      ratingKey,
      `s:${sortBy}:${sortDirection}`,
      `p:${page}:${pageSize}`
    ].filter(Boolean).join(':');
  }
}
