/**
 * Pet Health Database Service
 * 
 * Manages pet health records, medical history, vaccinations, and prescriptions.
 */
import { PetHealthRecord, Vaccination, Prescription, MedicalNote } from '@prisma/client';
import BaseService from './baseService';

export default class PetHealthService extends BaseService<PetHealthRecord> {
  constructor() {
    super('petHealthRecord');
    this.defaultInclude = {
      pet: true,
      vaccinations: true,
      prescriptions: true,
      notes: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    };
  }

  /**
   * Get pet health record
   */
  async getPetHealthRecord(petId: string): Promise<PetHealthRecord | null> {
    return this.prisma.petHealthRecord.findUnique({
      where: {
        petId,
      },
      include: this.defaultInclude,
    });
  }

  /**
   * Create or update pet health record
   */
  async upsertPetHealthRecord(
    petId: string,
    data: {
      weight?: number;
      weightUnit?: string;
      bloodType?: string;
      allergies?: string;
      conditions?: string;
      dietaryNeeds?: string;
      lastCheckupDate?: Date;
      updatedBy?: string;
    }
  ): Promise<PetHealthRecord> {
    const existingRecord = await this.prisma.petHealthRecord.findUnique({
      where: { petId },
    });
    
    if (existingRecord) {
      return this.prisma.petHealthRecord.update({
        where: { id: existingRecord.id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: this.defaultInclude,
      });
    }
    
    return this.prisma.petHealthRecord.create({
      data: {
        petId,
        ...data,
      },
      include: this.defaultInclude,
    });
  }

  /**
   * Add vaccination record
   */
  async addVaccination(
    data: {
      petId: string;
      name: string;
      manufacturer?: string;
      batchNumber?: string;
      administeredDate: Date;
      expirationDate?: Date;
      administeredBy?: string;
      administeredByStaffId?: string;
      notes?: string;
      createdBy?: string;
    }
  ): Promise<Vaccination> {
    return this.prisma.$transaction(async (tx) => {
      // Ensure pet health record exists
      let healthRecord = await tx.petHealthRecord.findUnique({
        where: { petId: data.petId },
      });
      
      if (!healthRecord) {
        healthRecord = await tx.petHealthRecord.create({
          data: {
            petId: data.petId,
          },
        });
      }
      
      // Create vaccination record
      return tx.vaccination.create({
        data: {
          petHealthRecordId: healthRecord.id,
          name: data.name,
          manufacturer: data.manufacturer,
          batchNumber: data.batchNumber,
          administeredDate: data.administeredDate,
          expirationDate: data.expirationDate,
          administeredBy: data.administeredBy,
          administeredByStaffId: data.administeredByStaffId,
          notes: data.notes,
          createdBy: data.createdBy,
        },
        include: {
          petHealthRecord: {
            include: {
              pet: true,
            },
          },
          administeredByStaff: true,
        },
      });
    });
  }

  /**
   * Get pet vaccinations
   */
  async getPetVaccinations(
    petId: string,
    options?: {
      active?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<Vaccination[]> {
    // Get the health record ID first
    const healthRecord = await this.prisma.petHealthRecord.findUnique({
      where: { petId },
      select: { id: true },
    });
    
    if (!healthRecord) {
      return [];
    }
    
    const where: any = {
      petHealthRecordId: healthRecord.id,
    };
    
    if (options?.active) {
      where.expirationDate = {
        gte: new Date(),
      };
    }
    
    return this.prisma.vaccination.findMany({
      where,
      include: {
        administeredByStaff: true,
      },
      orderBy: {
        administeredDate: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Add prescription
   */
  async addPrescription(
    data: {
      petId: string;
      medication: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      endDate?: Date;
      instructions?: string;
      prescribedBy?: string;
      prescribedByStaffId?: string;
      notes?: string;
      createdBy?: string;
    }
  ): Promise<Prescription> {
    return this.prisma.$transaction(async (tx) => {
      // Ensure pet health record exists
      let healthRecord = await tx.petHealthRecord.findUnique({
        where: { petId: data.petId },
      });
      
      if (!healthRecord) {
        healthRecord = await tx.petHealthRecord.create({
          data: {
            petId: data.petId,
          },
        });
      }
      
      // Create prescription record
      return tx.prescription.create({
        data: {
          petHealthRecordId: healthRecord.id,
          medication: data.medication,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: data.startDate,
          endDate: data.endDate,
          instructions: data.instructions,
          prescribedBy: data.prescribedBy,
          prescribedByStaffId: data.prescribedByStaffId,
          notes: data.notes,
          createdBy: data.createdBy,
        },
        include: {
          petHealthRecord: {
            include: {
              pet: true,
            },
          },
          prescribedByStaff: true,
        },
      });
    });
  }

  /**
   * Get pet prescriptions
   */
  async getPetPrescriptions(
    petId: string,
    options?: {
      active?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<Prescription[]> {
    // Get the health record ID first
    const healthRecord = await this.prisma.petHealthRecord.findUnique({
      where: { petId },
      select: { id: true },
    });
    
    if (!healthRecord) {
      return [];
    }
    
    const where: any = {
      petHealthRecordId: healthRecord.id,
    };
    
    if (options?.active) {
      where.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ];
    }
    
    return this.prisma.prescription.findMany({
      where,
      include: {
        prescribedByStaff: true,
      },
      orderBy: {
        startDate: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Add medical note to pet record
   */
  async addMedicalNote(
    data: {
      petId: string;
      title: string;
      content: string;
      noteType?: string;
      staffId?: string;
      appointmentId?: string;
      createdBy?: string;
    }
  ): Promise<MedicalNote> {
    return this.prisma.$transaction(async (tx) => {
      // Ensure pet health record exists
      let healthRecord = await tx.petHealthRecord.findUnique({
        where: { petId: data.petId },
      });
      
      if (!healthRecord) {
        healthRecord = await tx.petHealthRecord.create({
          data: {
            petId: data.petId,
          },
        });
      }
      
      // Create medical note
      return tx.medicalNote.create({
        data: {
          petHealthRecordId: healthRecord.id,
          title: data.title,
          content: data.content,
          noteType: data.noteType || 'General',
          staffId: data.staffId,
          appointmentId: data.appointmentId,
          createdBy: data.createdBy,
        },
        include: {
          petHealthRecord: {
            include: {
              pet: true,
            },
          },
          staff: true,
          appointment: true,
        },
      });
    });
  }

  /**
   * Get pet medical notes
   */
  async getPetMedicalNotes(
    petId: string,
    options?: {
      noteType?: string;
      skip?: number;
      take?: number;
      includeAppointmentDetails?: boolean;
    }
  ): Promise<MedicalNote[]> {
    // Get the health record ID first
    const healthRecord = await this.prisma.petHealthRecord.findUnique({
      where: { petId },
      select: { id: true },
    });
    
    if (!healthRecord) {
      return [];
    }
    
    const where: any = {
      petHealthRecordId: healthRecord.id,
    };
    
    if (options?.noteType) {
      where.noteType = options.noteType;
    }
    
    const include: any = {
      staff: true,
    };
    
    if (options?.includeAppointmentDetails) {
      include.appointment = {
        include: {
          service: true,
          clinic: true,
        },
      };
    }
    
    return this.prisma.medicalNote.findMany({
      where,
      include,
      orderBy: {
        createdAt: 'desc',
      },
      skip: options?.skip,
      take: options?.take,
    });
  }

  /**
   * Get upcoming vaccination reminders
   */
  async getUpcomingVaccinationReminders(
    daysInAdvance: number = 30
  ): Promise<Array<{
    vaccinationId: string;
    petId: string;
    petName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    vaccineName: string;
    expirationDate: Date;
    daysRemaining: number;
  }>> {
    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(today.getDate() + daysInAdvance);
    
    return this.prisma.$queryRaw`
      SELECT 
        v.id as "vaccinationId",
        p.id as "petId",
        p.name as "petName",
        CONCAT(u.first_name, ' ', u.last_name) as "ownerName",
        u.email as "ownerEmail",
        u.phone as "ownerPhone",
        v.name as "vaccineName",
        v.expiration_date as "expirationDate",
        EXTRACT(DAY FROM (v.expiration_date - CURRENT_DATE)) as "daysRemaining"
      FROM vaccinations v
      JOIN pet_health_records phr ON v.pet_health_record_id = phr.id
      JOIN pets p ON phr.pet_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE 
        v.expiration_date BETWEEN CURRENT_DATE AND ${reminderDate}
        AND p.is_active = true
      ORDER BY v.expiration_date ASC
    `;
  }

  /**
   * Get upcoming medication reminders
   */
  async getUpcomingMedicationReminders(
    daysInAdvance: number = 7
  ): Promise<Array<{
    prescriptionId: string;
    petId: string;
    petName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    medication: string;
    endDate: Date;
    daysRemaining: number;
  }>> {
    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(today.getDate() + daysInAdvance);
    
    return this.prisma.$queryRaw`
      SELECT 
        pr.id as "prescriptionId",
        p.id as "petId",
        p.name as "petName",
        CONCAT(u.first_name, ' ', u.last_name) as "ownerName",
        u.email as "ownerEmail",
        u.phone as "ownerPhone",
        pr.medication,
        pr.end_date as "endDate",
        EXTRACT(DAY FROM (pr.end_date - CURRENT_DATE)) as "daysRemaining"
      FROM prescriptions pr
      JOIN pet_health_records phr ON pr.pet_health_record_id = phr.id
      JOIN pets p ON phr.pet_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE 
        pr.end_date BETWEEN CURRENT_DATE AND ${reminderDate}
        AND p.is_active = true
      ORDER BY pr.end_date ASC
    `;
  }

  /**
   * Generate health summary for pet
   */
  async generatePetHealthSummary(petId: string): Promise<{
    petId: string;
    petName: string;
    species: string;
    breed: string;
    age: number;
    weight?: number;
    weightUnit?: string;
    currentConditions: string[];
    allergies: string[];
    activeVaccinations: number;
    upcomingVaccinations: number;
    activePrescriptions: number;
    recentAppointments: Array<{
      id: string;
      date: Date;
      service: string;
      clinic: string;
      notes?: string;
    }>;
    nextAppointment?: {
      id: string;
      date: Date;
      service: string;
      clinic: string;
    };
  }> {
    // Get pet details with health record
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
      include: {
        healthRecord: true,
      },
    });
    
    if (!pet || !pet.healthRecord) {
      throw new Error(`Pet not found or has no health record: ${petId}`);
    }
    
    // Get current conditions and allergies as arrays
    const conditions = pet.healthRecord.conditions ? 
      pet.healthRecord.conditions.split(',').map(c => c.trim()) : [];
    
    const allergies = pet.healthRecord.allergies ?
      pet.healthRecord.allergies.split(',').map(a => a.trim()) : [];
    
    // Count active vaccinations
    const today = new Date();
    const activeVaccinations = await this.prisma.vaccination.count({
      where: {
        petHealthRecordId: pet.healthRecord.id,
        expirationDate: {
          gte: today,
        },
      },
    });
    
    // Count upcoming vaccinations (expiring in next 60 days)
    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(today.getDate() + 60);
    
    const upcomingVaccinations = await this.prisma.vaccination.count({
      where: {
        petHealthRecordId: pet.healthRecord.id,
        expirationDate: {
          gte: today,
          lte: sixtyDaysLater,
        },
      },
    });
    
    // Count active prescriptions
    const activePrescriptions = await this.prisma.prescription.count({
      where: {
        petHealthRecordId: pet.healthRecord.id,
        OR: [
          { endDate: null },
          { endDate: { gte: today } },
        ],
      },
    });
    
    // Get recent appointments
    const recentAppointments = await this.prisma.appointment.findMany({
      where: {
        petId,
        date: {
          lt: today,
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 3,
      include: {
        service: true,
        clinic: true,
        notes: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
    
    // Get next appointment
    const nextAppointment = await this.prisma.appointment.findFirst({
      where: {
        petId,
        date: {
          gte: today,
        },
        status: {
          in: ['Scheduled', 'Confirmed'],
        },
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        service: true,
        clinic: true,
      },
    });
    
    // Calculate age in years
    const birthDate = pet.birthDate || new Date();
    const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    // Format recent appointments
    const formattedRecentAppointments = recentAppointments.map(app => ({
      id: app.id,
      date: app.date,
      service: app.service.name,
      clinic: app.clinic.name,
      notes: app.notes[0]?.content,
    }));
    
    // Format next appointment if exists
    let formattedNextAppointment;
    if (nextAppointment) {
      formattedNextAppointment = {
        id: nextAppointment.id,
        date: nextAppointment.date,
        service: nextAppointment.service.name,
        clinic: nextAppointment.clinic.name,
      };
    }
    
    return {
      petId: pet.id,
      petName: pet.name,
      species: pet.species,
      breed: pet.breed || 'Unknown',
      age: Math.floor(ageInYears * 10) / 10, // Round to 1 decimal place
      weight: pet.healthRecord.weight,
      weightUnit: pet.healthRecord.weightUnit,
      currentConditions: conditions,
      allergies: allergies,
      activeVaccinations,
      upcomingVaccinations,
      activePrescriptions,
      recentAppointments: formattedRecentAppointments,
      nextAppointment: formattedNextAppointment,
    };
  }
}
