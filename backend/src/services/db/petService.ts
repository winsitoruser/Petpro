/**
 * Pet Database Service
 * 
 * Manages pet records and associated health information.
 */
import { Pet, PetHealthRecord, PetVaccination, PetAllergy, PetMedication } from '@prisma/client';
import BaseService from './baseService';
import { PetSpecies } from '../../types/models';

export default class PetService extends BaseService<Pet> {
  constructor() {
    super('pet');
    this.searchFields = ['name', 'species', 'breed'];
    this.defaultInclude = {
      owner: {
        select: {
          id: true,
          email: true,
          profile: true,
        }
      },
      healthRecords: {
        orderBy: {
          recordDate: 'desc',
        },
      },
      vaccinations: {
        orderBy: {
          administeredDate: 'desc',
        },
      },
      allergies: true,
      medications: {
        where: {
          active: true,
        },
        orderBy: {
          startDate: 'desc',
        },
      },
    };
  }

  /**
   * Find all pets for a specific user
   */
  async findPetsByUser(userId: string): Promise<Pet[]> {
    return this.prisma.pet.findMany({
      where: {
        userId,
        active: true,
        deletedAt: null,
      },
      include: this.defaultInclude,
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Create a new pet with health records
   */
  async createPet(petData: {
    userId: string;
    name: string;
    species: PetSpecies;
    breed?: string;
    birthdate?: Date;
    weight?: number;
    gender?: string;
    microchipId?: string;
    pictureUrl?: string;
    attributes?: Record<string, any>;
    healthRecords?: Array<{
      recordDate: Date;
      recordType: string;
      description: string;
      vetName?: string;
      documents?: string[];
    }>;
    vaccinations?: Array<{
      name: string;
      administeredDate: Date;
      expirationDate?: Date;
      lotNumber?: string;
      administeredBy?: string;
      documentUrl?: string;
    }>;
    allergies?: Array<{
      allergen: string;
      severity?: string;
      diagnosisDate?: Date;
      symptoms?: string;
      treatment?: string;
    }>;
    medications?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      endDate?: Date;
      instructions?: string;
      prescribedBy?: string;
      active?: boolean;
    }>;
  }): Promise<Pet> {
    const {
      healthRecords = [],
      vaccinations = [],
      allergies = [],
      medications = [],
      ...petDetails
    } = petData;

    return this.prisma.$transaction(async (tx) => {
      // Create the pet
      const pet = await tx.pet.create({
        data: {
          ...petDetails,
          active: true,
          attributes: petDetails.attributes || {},
        },
      });

      // Add health records if provided
      if (healthRecords.length > 0) {
        await tx.petHealthRecord.createMany({
          data: healthRecords.map(record => ({
            ...record,
            petId: pet.id,
            documents: record.documents || [],
          })),
        });
      }

      // Add vaccinations if provided
      if (vaccinations.length > 0) {
        await tx.petVaccination.createMany({
          data: vaccinations.map(vaccine => ({
            ...vaccine,
            petId: pet.id,
          })),
        });
      }

      // Add allergies if provided
      if (allergies.length > 0) {
        await tx.petAllergy.createMany({
          data: allergies.map(allergy => ({
            ...allergy,
            petId: pet.id,
          })),
        });
      }

      // Add medications if provided
      if (medications.length > 0) {
        await tx.petMedication.createMany({
          data: medications.map(med => ({
            ...med,
            active: med.active !== undefined ? med.active : true,
            petId: pet.id,
          })),
        });
      }

      // Return the complete pet with relations
      return tx.pet.findUnique({
        where: { id: pet.id },
        include: this.defaultInclude,
      }) as Promise<Pet>;
    });
  }

  /**
   * Add a health record to a pet
   */
  async addHealthRecord(
    petId: string,
    recordData: {
      recordDate: Date;
      recordType: string;
      description: string;
      vetName?: string;
      documents?: string[];
    }
  ): Promise<PetHealthRecord> {
    return this.prisma.petHealthRecord.create({
      data: {
        ...recordData,
        petId,
        documents: recordData.documents || [],
      },
    });
  }

  /**
   * Add a vaccination to a pet
   */
  async addVaccination(
    petId: string,
    vaccinationData: {
      name: string;
      administeredDate: Date;
      expirationDate?: Date;
      lotNumber?: string;
      administeredBy?: string;
      documentUrl?: string;
    }
  ): Promise<PetVaccination> {
    return this.prisma.petVaccination.create({
      data: {
        ...vaccinationData,
        petId,
      },
    });
  }

  /**
   * Add an allergy to a pet
   */
  async addAllergy(
    petId: string,
    allergyData: {
      allergen: string;
      severity?: string;
      diagnosisDate?: Date;
      symptoms?: string;
      treatment?: string;
    }
  ): Promise<PetAllergy> {
    return this.prisma.petAllergy.create({
      data: {
        ...allergyData,
        petId,
      },
    });
  }

  /**
   * Add a medication to a pet
   */
  async addMedication(
    petId: string,
    medicationData: {
      name: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      endDate?: Date;
      instructions?: string;
      prescribedBy?: string;
      active?: boolean;
    }
  ): Promise<PetMedication> {
    return this.prisma.petMedication.create({
      data: {
        ...medicationData,
        active: medicationData.active !== undefined ? medicationData.active : true,
        petId,
      },
    });
  }

  /**
   * Get upcoming vaccinations that will expire within days
   */
  async getUpcomingVaccinationExpirations(days: number = 30): Promise<PetVaccination[]> {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    return this.prisma.petVaccination.findMany({
      where: {
        expirationDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });
  }

  /**
   * Soft delete a pet
   */
  async softDeletePet(petId: string): Promise<Pet> {
    return this.prisma.pet.update({
      where: { id: petId },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });
  }
}
