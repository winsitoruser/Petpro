import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PetHealthRecord } from '../../models/pet-health/pet-health-record.model';
import { PetVaccination } from '../../models/pet-health/pet-vaccination.model';
import { PetMedication } from '../../models/pet-health/pet-medication.model';
import { Pet } from '../../models/pet.model';
import { CreatePetHealthRecordDto } from './dto/create-pet-health-record.dto';
import { CreatePetVaccinationDto } from './dto/create-pet-vaccination.dto';
import { CreatePetMedicationDto } from './dto/create-pet-medication.dto';

@Injectable()
export class PetHealthRecordService {
  constructor(
    @InjectModel(PetHealthRecord)
    private petHealthRecordModel: typeof PetHealthRecord,
    @InjectModel(PetVaccination)
    private petVaccinationModel: typeof PetVaccination,
    @InjectModel(PetMedication)
    private petMedicationModel: typeof PetMedication,
    @InjectModel(Pet)
    private petModel: typeof Pet,
    private sequelize: Sequelize,
  ) {}

  async create(createPetHealthRecordDto: CreatePetHealthRecordDto): Promise<PetHealthRecord> {
    // Verify pet exists
    const pet = await this.petModel.findByPk(createPetHealthRecordDto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${createPetHealthRecordDto.petId} not found`);
    }

    // Use transaction to ensure all operations are atomic
    const transaction = await this.sequelize.transaction();

    try {
      // Create the health record
      const healthRecord = await this.petHealthRecordModel.create({
        petId: createPetHealthRecordDto.petId,
        recordDate: new Date(createPetHealthRecordDto.recordDate),
        weight: createPetHealthRecordDto.weight,
        weightUnit: createPetHealthRecordDto.weightUnit,
        generalHealth: createPetHealthRecordDto.generalHealth,
        dietNotes: createPetHealthRecordDto.dietNotes,
        behaviorNotes: createPetHealthRecordDto.behaviorNotes,
        exerciseNotes: createPetHealthRecordDto.exerciseNotes,
        symptomsNotes: createPetHealthRecordDto.symptomsNotes,
        vetVisitNotes: createPetHealthRecordDto.vetVisitNotes,
        nextCheckupDate: createPetHealthRecordDto.nextCheckupDate 
          ? new Date(createPetHealthRecordDto.nextCheckupDate) 
          : null,
        vitalSigns: createPetHealthRecordDto.vitalSigns,
        allergies: createPetHealthRecordDto.allergies,
        conditions: createPetHealthRecordDto.conditions,
        photos: createPetHealthRecordDto.photos,
      }, { transaction });

      // Create related vaccinations if provided
      if (createPetHealthRecordDto.vaccinations?.length) {
        for (const vaccinationDto of createPetHealthRecordDto.vaccinations) {
          await this.petVaccinationModel.create({
            ...vaccinationDto,
            healthRecordId: healthRecord.id,
            dateAdministered: new Date(vaccinationDto.dateAdministered),
            expirationDate: vaccinationDto.expirationDate 
              ? new Date(vaccinationDto.expirationDate) 
              : null,
          }, { transaction });
        }
      }

      // Create related medications if provided
      if (createPetHealthRecordDto.medications?.length) {
        for (const medicationDto of createPetHealthRecordDto.medications) {
          await this.petMedicationModel.create({
            ...medicationDto,
            healthRecordId: healthRecord.id,
            startDate: new Date(medicationDto.startDate),
            endDate: medicationDto.endDate 
              ? new Date(medicationDto.endDate) 
              : null,
          }, { transaction });
        }
      }

      await transaction.commit();
      return this.findOne(healthRecord.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async findAll(petId?: string): Promise<PetHealthRecord[]> {
    const where = petId ? { petId } : {};
    
    return this.petHealthRecordModel.findAll({
      where,
      include: [
        { model: PetVaccination },
        { model: PetMedication },
      ],
      order: [['recordDate', 'DESC']],
    });
  }

  async findOne(id: string): Promise<PetHealthRecord> {
    const healthRecord = await this.petHealthRecordModel.findByPk(id, {
      include: [
        { model: PetVaccination },
        { model: PetMedication },
      ],
    });
    
    if (!healthRecord) {
      throw new NotFoundException(`Pet health record with ID ${id} not found`);
    }
    
    return healthRecord;
  }

  async update(id: string, updateHealthRecordDto: any): Promise<PetHealthRecord> {
    const healthRecord = await this.findOne(id);
    
    await healthRecord.update(updateHealthRecordDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const healthRecord = await this.findOne(id);
    await healthRecord.destroy();
  }

  // Vaccination-specific methods
  async createVaccination(createVaccinationDto: CreatePetVaccinationDto): Promise<PetVaccination> {
    // Verify pet exists
    const pet = await this.petModel.findByPk(createVaccinationDto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${createVaccinationDto.petId} not found`);
    }

    const vaccination = await this.petVaccinationModel.create({
      ...createVaccinationDto,
      dateAdministered: new Date(createVaccinationDto.dateAdministered),
      expirationDate: createVaccinationDto.expirationDate 
        ? new Date(createVaccinationDto.expirationDate) 
        : null,
    });

    return vaccination;
  }

  async findVaccinations(petId?: string): Promise<PetVaccination[]> {
    const where = petId ? { petId } : {};
    
    return this.petVaccinationModel.findAll({
      where,
      order: [['dateAdministered', 'DESC']],
    });
  }

  async findVaccinationById(id: string): Promise<PetVaccination> {
    const vaccination = await this.petVaccinationModel.findByPk(id);
    
    if (!vaccination) {
      throw new NotFoundException(`Vaccination with ID ${id} not found`);
    }
    
    return vaccination;
  }

  async updateVaccination(id: string, updateVaccinationDto: any): Promise<PetVaccination> {
    const vaccination = await this.findVaccinationById(id);
    
    await vaccination.update(updateVaccinationDto);
    return vaccination;
  }

  async removeVaccination(id: string): Promise<void> {
    const vaccination = await this.findVaccinationById(id);
    await vaccination.destroy();
  }

  // Medication-specific methods
  async createMedication(createMedicationDto: CreatePetMedicationDto): Promise<PetMedication> {
    // Verify pet exists
    const pet = await this.petModel.findByPk(createMedicationDto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${createMedicationDto.petId} not found`);
    }

    const medication = await this.petMedicationModel.create({
      ...createMedicationDto,
      startDate: new Date(createMedicationDto.startDate),
      endDate: createMedicationDto.endDate 
        ? new Date(createMedicationDto.endDate) 
        : null,
    });

    return medication;
  }

  async findMedications(petId?: string): Promise<PetMedication[]> {
    const where = petId ? { petId } : {};
    
    return this.petMedicationModel.findAll({
      where,
      order: [['startDate', 'DESC']],
    });
  }

  async findMedicationById(id: string): Promise<PetMedication> {
    const medication = await this.petMedicationModel.findByPk(id);
    
    if (!medication) {
      throw new NotFoundException(`Medication with ID ${id} not found`);
    }
    
    return medication;
  }

  async updateMedication(id: string, updateMedicationDto: any): Promise<PetMedication> {
    const medication = await this.findMedicationById(id);
    
    await medication.update(updateMedicationDto);
    return medication;
  }

  async removeMedication(id: string): Promise<void> {
    const medication = await this.findMedicationById(id);
    await medication.destroy();
  }

  // Health metrics dashboard data
  async getPetHealthDashboard(petId: string): Promise<any> {
    const pet = await this.petModel.findByPk(petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    // Get latest health record
    const latestHealthRecord = await this.petHealthRecordModel.findOne({
      where: { petId },
      order: [['recordDate', 'DESC']],
      include: [
        { model: PetVaccination },
        { model: PetMedication },
      ],
    });

    // Get weight history for tracking
    const weightHistory = await this.petHealthRecordModel.findAll({
      attributes: ['recordDate', 'weight', 'weightUnit'],
      where: { 
        petId,
        weight: { [Sequelize.Op.not]: null } 
      },
      order: [['recordDate', 'ASC']],
    });

    // Get active medications
    const activeMedications = await this.petMedicationModel.findAll({
      where: {
        petId,
        isActive: true,
        endDate: { 
          [Sequelize.Op.or]: [
            { [Sequelize.Op.gt]: new Date() },
            { [Sequelize.Op.is]: null }
          ]
        },
      },
    });

    // Get upcoming vaccinations that need renewal
    const today = new Date();
    const nextThreeMonths = new Date();
    nextThreeMonths.setMonth(nextThreeMonths.getMonth() + 3);

    const upcomingVaccinations = await this.petVaccinationModel.findAll({
      where: {
        petId,
        expirationDate: {
          [Sequelize.Op.between]: [today, nextThreeMonths],
        },
        isActive: true,
      },
    });

    // Return dashboard data
    return {
      pet: {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate,
      },
      latestHealthRecord,
      weightHistory: weightHistory.map(record => ({
        date: record.recordDate,
        weight: record.weight,
        unit: record.weightUnit,
      })),
      activeMedications,
      upcomingVaccinations,
    };
  }
}
