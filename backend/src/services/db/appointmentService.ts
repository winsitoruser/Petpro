/**
 * Appointment Database Service
 * 
 * Manages veterinary appointments, scheduling, and related operations.
 */
import { Appointment, AppointmentNote, AppointmentStatus } from '@prisma/client';
import BaseService from './baseService';

export default class AppointmentService extends BaseService<Appointment> {
  constructor() {
    super('appointment');
    this.searchFields = ['notes'];
    this.defaultInclude = {
      clinic: {
        include: {
          address: true,
        },
      },
      service: true,
      staff: true,
      client: {
        select: {
          id: true,
          email: true,
          profile: true,
        },
      },
      pet: true,
      appointmentNotes: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    };
  }

  /**
   * Create a new appointment
   */
  async createAppointment(appointmentData: {
    clinicId: string;
    serviceId: string;
    staffId?: string;
    userId: string;
    petId: string;
    startTime: Date;
    endTime: Date;
    notes?: string;
  }): Promise<Appointment> {
    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          ...appointmentData,
          status: AppointmentStatus.SCHEDULED,
        },
      });

      // Add initial note if provided
      if (appointmentData.notes) {
        await tx.appointmentNote.create({
          data: {
            appointmentId: appointment.id,
            note: appointmentData.notes,
            addedBy: appointmentData.userId, // Added by the client
          },
        });
      }

      return tx.appointment.findUnique({
        where: { id: appointment.id },
        include: this.defaultInclude,
      }) as Promise<Appointment>;
    });
  }

  /**
   * Find upcoming appointments for a user
   */
  async findUpcomingAppointmentsForUser(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<Appointment[]> {
    const now = new Date();
    
    return this.prisma.appointment.findMany({
      where: {
        userId,
        startTime: {
          gte: now,
        },
        status: {
          notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
        },
      },
      include: this.defaultInclude,
      orderBy: {
        startTime: 'asc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Find past appointments for a user
   */
  async findPastAppointmentsForUser(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<Appointment[]> {
    const now = new Date();
    
    return this.prisma.appointment.findMany({
      where: {
        userId,
        startTime: {
          lt: now,
        },
      },
      include: this.defaultInclude,
      orderBy: {
        startTime: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Find upcoming appointments for a clinic
   */
  async findUpcomingAppointmentsForClinic(
    clinicId: string,
    options?: {
      skip?: number;
      take?: number;
      staffId?: string;
      date?: Date;
    }
  ): Promise<Appointment[]> {
    const now = new Date();
    let startDate = now;
    let endDate: Date | undefined = undefined;
    
    // If specific date provided, use it instead of "from now onwards"
    if (options?.date) {
      startDate = new Date(options.date);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(options.date);
      endDate.setHours(23, 59, 59, 999);
    }
    
    const where: any = {
      clinicId,
      startTime: {
        gte: startDate,
      },
      status: {
        notIn: [AppointmentStatus.CANCELLED],
      },
    };
    
    // Add end date if provided
    if (endDate) {
      where.startTime['lte'] = endDate;
    }
    
    // Filter by staff if provided
    if (options?.staffId) {
      where.staffId = options.staffId;
    }
    
    return this.prisma.appointment.findMany({
      where,
      include: this.defaultInclude,
      orderBy: {
        startTime: 'asc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Update appointment status
   */
  async updateStatus(
    appointmentId: string,
    status: AppointmentStatus,
    userId: string,
    note?: string,
    cancelReason?: string
  ): Promise<Appointment> {
    const updateData: any = {
      status,
    };
    
    // Add cancel info if status is cancelled
    if (status === AppointmentStatus.CANCELLED) {
      updateData.cancelledBy = userId;
      updateData.cancelReason = cancelReason || 'No reason provided';
    }
    
    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: updateData,
      });
      
      // Add note if provided
      if (note) {
        await tx.appointmentNote.create({
          data: {
            appointmentId,
            note: `Status changed to ${status}${cancelReason ? ': ' + cancelReason : ''}. ${note}`,
            addedBy: userId,
          },
        });
      }
      
      return tx.appointment.findUnique({
        where: { id: appointment.id },
        include: this.defaultInclude,
      }) as Promise<Appointment>;
    });
  }

  /**
   * Add note to an appointment
   */
  async addNote(
    appointmentId: string,
    note: string,
    userId: string
  ): Promise<AppointmentNote> {
    return this.prisma.appointmentNote.create({
      data: {
        appointmentId,
        note,
        addedBy: userId,
      },
    });
  }

  /**
   * Find appointments for a specific pet
   */
  async findAppointmentsForPet(
    petId: string,
    options?: {
      skip?: number;
      take?: number;
      includeUpcoming?: boolean;
      includePast?: boolean;
    }
  ): Promise<Appointment[]> {
    const now = new Date();
    const includeUpcoming = options?.includeUpcoming !== false;
    const includePast = options?.includePast !== false;
    
    // Build the where clause based on time filters
    const where: any = { petId };
    
    if (includeUpcoming && !includePast) {
      where.startTime = { gte: now };
    } else if (includePast && !includeUpcoming) {
      where.startTime = { lt: now };
    }
    
    return this.prisma.appointment.findMany({
      where,
      include: this.defaultInclude,
      orderBy: {
        startTime: includeUpcoming && !includePast ? 'asc' : 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Get appointment statistics for a clinic
   */
  async getClinicStats(
    clinicId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalAppointments: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  }> {
    const timeFilter: any = {};
    
    if (startDate) {
      timeFilter.gte = startDate;
    }
    
    if (endDate) {
      timeFilter.lte = endDate;
    }
    
    const where: any = {
      clinicId,
    };
    
    if (Object.keys(timeFilter).length > 0) {
      where.startTime = timeFilter;
    }
    
    // Count total and by status
    const [
      totalAppointments,
      scheduled,
      confirmed,
      completed,
      cancelled,
      noShow,
    ] = await Promise.all([
      this.prisma.appointment.count({ where }),
      this.prisma.appointment.count({ 
        where: { ...where, status: AppointmentStatus.SCHEDULED } 
      }),
      this.prisma.appointment.count({ 
        where: { ...where, status: AppointmentStatus.CONFIRMED } 
      }),
      this.prisma.appointment.count({ 
        where: { ...where, status: AppointmentStatus.COMPLETED } 
      }),
      this.prisma.appointment.count({ 
        where: { ...where, status: AppointmentStatus.CANCELLED } 
      }),
      this.prisma.appointment.count({ 
        where: { ...where, status: AppointmentStatus.NO_SHOW } 
      }),
    ]);
    
    return {
      totalAppointments,
      scheduled,
      confirmed,
      completed,
      cancelled,
      noShow,
    };
  }
}
