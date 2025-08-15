import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PetGroomingService } from '../../models/pet-grooming/pet-grooming-service.model';
import { PetGroomingServiceCategory } from '../../models/pet-grooming/pet-grooming-service-category.model';
import { PetGroomingServiceMapping } from '../../models/pet-grooming/pet-grooming-service-mapping.model';
import { PetGroomingAddOn } from '../../models/pet-grooming/pet-grooming-add-on.model';
import { PetGroomingAppointment } from '../../models/pet-grooming/pet-grooming-appointment.model';
import { PetGroomingAppointmentAddOn } from '../../models/pet-grooming/pet-grooming-appointment-add-on.model';
import { Groomer } from '../../models/pet-grooming/groomer.model';
import { PetGroomingAvailability } from '../../models/pet-grooming/pet-grooming-availability.model';
import { PetGroomingPhoto } from '../../models/pet-grooming/pet-grooming-photo.model';

import { PetGroomingServiceService } from './pet-grooming-service.service';
import { PetGroomingServiceController } from './pet-grooming-service.controller';
import { PetGroomingCategoryService } from './pet-grooming-category.service';
import { PetGroomingCategoryController } from './pet-grooming-category.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PetGroomingService,
      PetGroomingServiceCategory,
      PetGroomingServiceMapping,
      PetGroomingAddOn,
      PetGroomingAppointment,
      PetGroomingAppointmentAddOn,
      Groomer,
      PetGroomingAvailability,
      PetGroomingPhoto,
    ]),
  ],
  controllers: [
    PetGroomingServiceController,
    PetGroomingCategoryController,
  ],
  providers: [
    PetGroomingServiceService,
    PetGroomingCategoryService,
  ],
  exports: [
    PetGroomingServiceService,
    PetGroomingCategoryService,
  ],
})
export class PetGroomingModule {}
