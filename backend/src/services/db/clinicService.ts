/**
 * Clinic Database Service
 * 
 * Manages veterinary clinics, services, staff, and availability.
 */
import { Clinic, ClinicService as ClinicServiceModel, ClinicStaff, StaffAvailability } from '@prisma/client';
import BaseService from './baseService';

export default class ClinicService extends BaseService<Clinic> {
  constructor() {
    super('clinic');
    this.searchFields = ['name', 'description', 'email', 'phoneNumber', 'website'];
    this.defaultInclude = {
      address: true,
      owner: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      services: true,
      staff: {
        where: {
          active: true,
        },
        include: {
          availability: true,
        },
      },
    };
  }

  /**
   * Find clinics by location (proximity search)
   */
  async findClinicsByLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    options?: {
      skip?: number;
      take?: number;
      includeInactive?: boolean;
    }
  ): Promise<Clinic[]> {
    // Using raw SQL for the distance calculation
    // This assumes PostgreSQL with PostGIS extension
    // If PostGIS is not available, we can use the Haversine formula directly
    
    const take = options?.take || 10;
    const skip = options?.skip || 0;
    const includeInactive = options?.includeInactive || false;
    
    const results = await this.prisma.$queryRaw`
      SELECT c.*, 
      (6371 * acos(cos(radians(${latitude})) * cos(radians(a.latitude)) * 
      cos(radians(a.longitude) - radians(${longitude})) + 
      sin(radians(${latitude})) * sin(radians(a.latitude)))) AS distance
      FROM clinics c
      JOIN addresses a ON c.address_id = a.id
      WHERE 
        ${includeInactive ? true : Prisma.sql`c.active = true AND c.deleted_at IS NULL`}
      HAVING distance <= ${radiusKm}
      ORDER BY distance
      LIMIT ${take} OFFSET ${skip}
    `;
    
    // Fetch the complete clinics with relations using the IDs from the raw query
    const clinicIds = results.map((r: any) => r.id);
    
    if (clinicIds.length === 0) {
      return [];
    }
    
    return this.findMany({
      where: {
        id: {
          in: clinicIds,
        },
      },
      include: this.defaultInclude,
    });
  }

  /**
   * Find clinics by service type
   */
  async findClinicsByService(
    serviceType: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<Clinic[]> {
    const take = options?.take || 10;
    const skip = options?.skip || 0;
    
    return this.prisma.clinic.findMany({
      where: {
        active: true,
        deletedAt: null,
        services: {
          some: {
            name: {
              contains: serviceType,
              mode: 'insensitive',
            },
            active: true,
          },
        },
      },
      include: this.defaultInclude,
      skip,
      take,
    });
  }

  /**
   * Create a new clinic with address, services and staff
   */
  async createClinic(clinicData: {
    userId: string;
    name: string;
    description?: string;
    phoneNumber: string;
    email: string;
    website?: string;
    logoUrl?: string;
    businessHours: Record<string, any>;
    address: {
      streetAddress: string;
      aptSuite?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
      latitude?: number;
      longitude?: number;
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
      title: string;
      bio?: string;
      specialties: string[];
      pictureUrl?: string;
      email?: string;
      phoneNumber?: string;
      availability?: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }>;
    }>;
  }): Promise<Clinic> {
    const { address, services = [], staff = [], ...clinicDetails } = clinicData;

    return this.prisma.$transaction(async (tx) => {
      // Create address first
      const createdAddress = await tx.address.create({
        data: {
          ...address,
          addressType: 'business',
          isDefault: true,
          userId: clinicData.userId,
        },
      });

      // Create clinic with address reference
      const clinic = await tx.clinic.create({
        data: {
          ...clinicDetails,
          addressId: createdAddress.id,
          active: true,
          verified: false,
        },
      });

      // Create services if provided
      if (services.length > 0) {
        await tx.clinicService.createMany({
          data: services.map(service => ({
            ...service,
            clinicId: clinic.id,
            active: true,
          })),
        });
      }

      // Create staff members with availability
      for (const staffMember of staff) {
        const { availability = [], ...staffDetails } = staffMember;
        
        const createdStaff = await tx.clinicStaff.create({
          data: {
            ...staffDetails,
            clinicId: clinic.id,
            specialties: staffDetails.specialties || [],
            active: true,
          },
        });

        if (availability.length > 0) {
          await tx.staffAvailability.createMany({
            data: availability.map(slot => ({
              ...slot,
              clinicId: clinic.id,
              staffId: createdStaff.id,
            })),
          });
        }
      }

      // Return the complete clinic with relations
      return tx.clinic.findUnique({
        where: { id: clinic.id },
        include: this.defaultInclude,
      }) as Promise<Clinic>;
    });
  }

  /**
   * Add a service to a clinic
   */
  async addService(
    clinicId: string,
    serviceData: {
      name: string;
      description?: string;
      duration: number;
      price: number;
    }
  ): Promise<ClinicServiceModel> {
    return this.prisma.clinicService.create({
      data: {
        ...serviceData,
        clinicId,
        active: true,
      },
    });
  }

  /**
   * Add a staff member to a clinic
   */
  async addStaff(
    clinicId: string,
    staffData: {
      firstName: string;
      lastName: string;
      title: string;
      bio?: string;
      specialties: string[];
      pictureUrl?: string;
      email?: string;
      phoneNumber?: string;
      availability?: Array<{
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }>;
    }
  ): Promise<ClinicStaff> {
    const { availability = [], ...staffDetails } = staffData;

    return this.prisma.$transaction(async (tx) => {
      const staff = await tx.clinicStaff.create({
        data: {
          ...staffDetails,
          clinicId,
          specialties: staffDetails.specialties || [],
          active: true,
        },
      });

      if (availability.length > 0) {
        await tx.staffAvailability.createMany({
          data: availability.map(slot => ({
            ...slot,
            clinicId,
            staffId: staff.id,
          })),
        });
      }

      return tx.clinicStaff.findUnique({
        where: { id: staff.id },
        include: {
          availability: true,
        },
      }) as Promise<ClinicStaff>;
    });
  }

  /**
   * Update staff availability
   */
  async updateStaffAvailability(
    staffId: string,
    availability: Array<{
      id?: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>
  ): Promise<StaffAvailability[]> {
    const staff = await this.prisma.clinicStaff.findUnique({
      where: { id: staffId },
      include: { availability: true },
    });

    if (!staff) {
      throw new Error('Staff not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete current availability
      await tx.staffAvailability.deleteMany({
        where: { staffId },
      });

      // Create new availability slots
      await tx.staffAvailability.createMany({
        data: availability.map(slot => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          staffId,
          clinicId: staff.clinicId,
        })),
      });

      return tx.staffAvailability.findMany({
        where: { staffId },
      });
    });
  }

  /**
   * Get available time slots for a specific service and date
   */
  async getAvailableTimeSlots(
    clinicId: string,
    serviceId: string,
    date: Date,
    options?: {
      staffId?: string;
    }
  ): Promise<Array<{ startTime: Date, endTime: Date, staffId: string }>> {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the service to determine duration
    const service = await this.prisma.clinicService.findUnique({
      where: { id: serviceId },
    });
    
    if (!service) {
      throw new Error('Service not found');
    }
    
    // Find staff availability for this day of week
    const staffQuery = {
      clinicId,
      active: true,
      availability: {
        some: {
          dayOfWeek,
        },
      },
    };
    
    // Add staff filter if specified
    if (options?.staffId) {
      staffQuery['id'] = options.staffId;
    }
    
    const staffMembers = await this.prisma.clinicStaff.findMany({
      where: staffQuery,
      include: {
        availability: {
          where: { dayOfWeek },
        },
      },
    });
    
    // Find existing appointments for this date to exclude those times
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ['cancelled', 'no_show'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
        staffId: true,
      },
    });
    
    // Generate available time slots
    const availableSlots = [];
    
    for (const staff of staffMembers) {
      for (const slot of staff.availability) {
        // Convert availability time strings to minutes since midnight
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        
        const slotStartMinutes = startHour * 60 + startMinute;
        const slotEndMinutes = endHour * 60 + endMinute;
        
        // Generate time slots in 15-minute increments
        for (let minutes = slotStartMinutes; minutes <= slotEndMinutes - service.duration; minutes += 15) {
          const slotStart = new Date(date);
          slotStart.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
          
          const slotEnd = new Date(date);
          slotEnd.setHours(
            Math.floor((minutes + service.duration) / 60),
            (minutes + service.duration) % 60,
            0,
            0
          );
          
          // Check if this slot overlaps with any existing appointment for this staff
          const isOverlapping = existingAppointments.some(appt => {
            if (appt.staffId !== staff.id) {
              return false;
            }
            
            const apptStart = new Date(appt.startTime).getTime();
            const apptEnd = new Date(appt.endTime).getTime();
            const currentStart = slotStart.getTime();
            const currentEnd = slotEnd.getTime();
            
            return (
              (currentStart >= apptStart && currentStart < apptEnd) ||
              (currentEnd > apptStart && currentEnd <= apptEnd) ||
              (currentStart <= apptStart && currentEnd >= apptEnd)
            );
          });
          
          if (!isOverlapping) {
            availableSlots.push({
              startTime: slotStart,
              endTime: slotEnd,
              staffId: staff.id,
            });
          }
        }
      }
    }
    
    // Sort slots by time
    return availableSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
}
