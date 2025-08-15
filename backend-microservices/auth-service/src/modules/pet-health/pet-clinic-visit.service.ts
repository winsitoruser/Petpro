import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PetClinicVisit, VisitStatus } from '../../models/pet-health/pet-clinic-visit.model';
import { Pet } from '../../models/pet.model';
import { CreatePetClinicVisitDto } from './dto/create-pet-clinic-visit.dto';

@Injectable()
export class PetClinicVisitService {
  constructor(
    @InjectModel(PetClinicVisit)
    private petClinicVisitModel: typeof PetClinicVisit,
    @InjectModel(Pet)
    private petModel: typeof Pet,
    private sequelize: Sequelize,
  ) {}

  async create(createPetClinicVisitDto: CreatePetClinicVisitDto): Promise<PetClinicVisit> {
    // Verify pet exists
    const pet = await this.petModel.findByPk(createPetClinicVisitDto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${createPetClinicVisitDto.petId} not found`);
    }

    const clinicVisit = await this.petClinicVisitModel.create({
      ...createPetClinicVisitDto,
    });

    return clinicVisit;
  }

  async findAll(petId?: string): Promise<PetClinicVisit[]> {
    const where = petId ? { petId } : {};
    
    return this.petClinicVisitModel.findAll({
      where,
      order: [['visitDate', 'DESC'], ['visitTime', 'DESC']],
    });
  }

  async findOne(id: string): Promise<PetClinicVisit> {
    const clinicVisit = await this.petClinicVisitModel.findByPk(id);
    
    if (!clinicVisit) {
      throw new NotFoundException(`Clinic visit with ID ${id} not found`);
    }
    
    return clinicVisit;
  }

  async update(id: string, updateClinicVisitDto: Partial<CreatePetClinicVisitDto>): Promise<PetClinicVisit> {
    const clinicVisit = await this.findOne(id);
    
    // Validate status transitions
    if (updateClinicVisitDto.status && clinicVisit.status !== updateClinicVisitDto.status) {
      this.validateStatusTransition(clinicVisit.status, updateClinicVisitDto.status);
    }
    
    await clinicVisit.update(updateClinicVisitDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const clinicVisit = await this.findOne(id);
    await clinicVisit.destroy();
  }

  async updateStatus(id: string, status: VisitStatus): Promise<PetClinicVisit> {
    const clinicVisit = await this.findOne(id);
    
    // Validate status transition
    this.validateStatusTransition(clinicVisit.status, status);
    
    await clinicVisit.update({ status });
    return this.findOne(id);
  }

  private validateStatusTransition(currentStatus: VisitStatus, newStatus: VisitStatus): void {
    // Define valid transitions
    const validTransitions = {
      [VisitStatus.SCHEDULED]: [
        VisitStatus.CHECKED_IN, 
        VisitStatus.CANCELLED, 
        VisitStatus.NO_SHOW
      ],
      [VisitStatus.CHECKED_IN]: [
        VisitStatus.IN_PROGRESS, 
        VisitStatus.CANCELLED
      ],
      [VisitStatus.IN_PROGRESS]: [
        VisitStatus.COMPLETED
      ],
      [VisitStatus.COMPLETED]: [], // No further transitions allowed
      [VisitStatus.CANCELLED]: [], // No further transitions allowed
      [VisitStatus.NO_SHOW]: []    // No further transitions allowed
    };
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Valid transitions from ${currentStatus} are: ${validTransitions[currentStatus].join(', ')}`
      );
    }
  }

  async getPetClinicHistory(petId: string): Promise<any> {
    const pet = await this.petModel.findByPk(petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${petId} not found`);
    }

    // Get all clinic visits
    const clinicVisits = await this.petClinicVisitModel.findAll({
      where: { petId },
      order: [['visitDate', 'DESC'], ['visitTime', 'DESC']],
    });

    // Group visits by year and month for timeline view
    const visitsByYear = clinicVisits.reduce((acc, visit) => {
      const year = new Date(visit.visitDate).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(visit);
      return acc;
    }, {});

    // Get statistics
    const stats = {
      totalVisits: clinicVisits.length,
      emergencyVisits: clinicVisits.filter(v => v.visitType === 'emergency').length,
      upcomingVisits: clinicVisits.filter(v => 
        v.status === VisitStatus.SCHEDULED && new Date(v.visitDate) > new Date()
      ).length,
      mostVisitedClinic: this.getMostFrequent(clinicVisits.map(v => v.clinicName))
    };

    // Return clinic history data
    return {
      pet: {
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        birthDate: pet.birthDate,
      },
      stats,
      visitsByYear,
      recentVisits: clinicVisits.slice(0, 5), // Last 5 visits
      upcomingVisits: clinicVisits.filter(v => 
        v.status === VisitStatus.SCHEDULED && new Date(v.visitDate) > new Date()
      ),
    };
  }

  private getMostFrequent(arr: string[]): string | null {
    if (!arr.length) return null;
    
    const counts = arr.reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    
    const maxCount = Math.max(...Object.values(counts) as number[]);
    const mostFrequent = Object.keys(counts).find(key => counts[key] === maxCount);
    
    return mostFrequent || null;
  }
}
