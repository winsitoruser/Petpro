/**
 * Type definitions for Pet types
 * 
 * This module provides TypeScript type definitions for pet-related enums and types
 * to ensure consistent type checking across the application.
 */

/**
 * Enum defining the different pet species in the system
 */
export enum PetSpecies {
  dog = "dog",
  cat = "cat",
  bird = "bird",
  fish = "fish",
  reptile = "reptile",
  small_mammal = "small_mammal",
  other = "other"
}

/**
 * Pet size categories
 */
export enum PetSize {
  TINY = "TINY",       // < 2 kg
  SMALL = "SMALL",     // 2-10 kg
  MEDIUM = "MEDIUM",   // 10-25 kg
  LARGE = "LARGE",     // 25-45 kg
  XLARGE = "XLARGE"    // > 45 kg
}

/**
 * Pet coat types for grooming services
 */
export enum CoatType {
  SHORT = "SHORT",
  MEDIUM = "MEDIUM",
  LONG = "LONG",
  DOUBLE = "DOUBLE",
  CURLY = "CURLY",
  WIRE = "WIRE",
  HAIRLESS = "HAIRLESS"
}

/**
 * Vaccination status
 */
export enum VaccinationStatus {
  UP_TO_DATE = "UP_TO_DATE",
  DUE_SOON = "DUE_SOON",
  OVERDUE = "OVERDUE",
  INCOMPLETE = "INCOMPLETE",
  EXEMPT = "EXEMPT",
  UNKNOWN = "UNKNOWN"
}

/**
 * Pet microchip status
 */
export enum MicrochipStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  UNKNOWN = "UNKNOWN"
}

/**
 * Interface for pet health status
 */
export interface PetHealthStatus {
  vaccinationStatus: VaccinationStatus;
  hasAllergies: boolean;
  hasMedicalConditions: boolean;
  hasCurrentMedications: boolean;
  lastCheckupDate: Date | null;
  microchipStatus: MicrochipStatus;
}
