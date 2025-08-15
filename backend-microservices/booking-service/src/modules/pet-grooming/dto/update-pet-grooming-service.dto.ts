import { PartialType } from '@nestjs/swagger';
import { CreatePetGroomingServiceDto } from './create-pet-grooming-service.dto';

export class UpdatePetGroomingServiceDto extends PartialType(CreatePetGroomingServiceDto) {}
