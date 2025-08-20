import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pet } from '../../../models/pet.model';

@Injectable()
export class PetOwnershipGuard implements CanActivate {
  constructor(
    @InjectModel(Pet)
    private petModel: typeof Pet,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const petId = request.params.petId || request.params.id;

    if (!user || !petId) {
      return false;
    }

    // Admin can access any pet
    if ((user as any).role === 'admin') {
      return true;
    }

    // Check if the pet belongs to the current user
    const pet = await this.petModel.findOne({
      where: {
        id: petId,
        userId: (user as any).id,
      },
    });

    if (!pet) {
      throw new ForbiddenException('You do not have access to this pet');
    }

    return true;
  }
}