import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private logger: LoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // If no user or role found, deny access
    if (!user || !user.role) {
      this.logger.warn(
        `Access denied: No user or role found in request`,
        'RolesGuard'
      );
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      this.logger.warn(
        `Access denied: User with role ${user.role} attempted to access resource requiring roles: ${requiredRoles.join(', ')}`,
        'RolesGuard'
      );
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
