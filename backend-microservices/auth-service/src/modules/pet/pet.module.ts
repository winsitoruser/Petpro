import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Pet } from '../../models/pet.model';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';

@Module({
  imports: [SequelizeModule.forFeature([Pet])],
  controllers: [PetController],
  providers: [PetService],
  exports: [PetService],
})
export class PetModule {}
