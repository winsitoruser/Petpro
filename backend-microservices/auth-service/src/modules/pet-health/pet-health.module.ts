import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PetHealthRecordService } from './pet-health-record.service';
import { PetHealthRecordController } from './pet-health-record.controller';
import { PetClinicVisitService } from './pet-clinic-visit.service';
import { PetClinicVisitController } from './pet-clinic-visit.controller';
import { PetHealthRecord } from '../../models/pet-health/pet-health-record.model';
import { PetVaccination } from '../../models/pet-health/pet-vaccination.model';
import { PetMedication } from '../../models/pet-health/pet-medication.model';
import { PetClinicVisit } from '../../models/pet-health/pet-clinic-visit.model';
import { Pet } from '../../models/pet.model';
import { PetModule } from '../pet/pet.module';
import { PetOwnershipGuard } from '../pet/guards/pet-ownership.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PetHealthRecord,
      PetVaccination, 
      PetMedication,
      PetClinicVisit,
      Pet
    ]),
    PetModule,
  ],
  controllers: [PetHealthRecordController, PetClinicVisitController],
  providers: [
    PetHealthRecordService,
    PetClinicVisitService,
    PetOwnershipGuard
  ],
  exports: [PetHealthRecordService, PetClinicVisitService],
})
export class PetHealthModule {}
