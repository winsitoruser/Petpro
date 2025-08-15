import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { Pet } from '../../models/pet.model';
import { EventsModule } from '../../events/events.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Pet]),
    EventsModule
  ],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService]
})
export class PetModule {}
