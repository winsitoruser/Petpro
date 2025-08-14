/**
 * Type definitions for Prisma models
 * 
 * These types allow TypeScript to properly type-check Prisma model usage
 * throughout the application.
 */

import { PetSpecies } from './petTypes';
import { Prisma } from '@prisma/client';

/**
 * Pet model as defined in the Prisma schema
 */
export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: PetSpecies;
  breed?: string | null;
  birthDate?: Date | null;
  weight?: number | null;
  color?: string | null;
  microchipId?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (when included via Prisma)
  healthRecords?: PetHealthRecord[];
  vaccinations?: PetVaccination[];
  allergies?: PetAllergy[];
  medications?: PetMedication[];
}

/**
 * PetHealthRecord model as defined in the Prisma schema
 */
export interface PetHealthRecord {
  id: string;
  petId: string;
  recordDate: Date;
  veterinarianName?: string | null;
  clinicName?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  weight?: number | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  pet?: Pet;
}

/**
 * PetVaccination model as defined in the Prisma schema
 */
export interface PetVaccination {
  id: string;
  petId: string;
  name: string;
  administeredDate: Date;
  expirationDate?: Date | null;
  administeredBy?: string | null;
  lotNumber?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  pet?: Pet;
}

/**
 * PetAllergy model as defined in the Prisma schema
 */
export interface PetAllergy {
  id: string;
  petId: string;
  allergen: string;
  severity?: string | null;
  diagnosedDate?: Date | null;
  symptoms?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  pet?: Pet;
}

/**
 * PetMedication model as defined in the Prisma schema
 */
export interface PetMedication {
  id: string;
  petId: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  prescribedBy?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  pet?: Pet;
}
