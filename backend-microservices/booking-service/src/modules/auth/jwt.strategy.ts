import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev_jwt_secret_key_change_in_production'),
    });
  }

  async validate(payload: any) {
    // In a microservices architecture, we validate the token but don't necessarily have
    // local access to the user database, which is managed by the Auth service
    
    if (!payload || !payload.sub || !payload.email) {
      this.logger.warn('Invalid JWT token payload', 'JwtStrategy');
      throw new UnauthorizedException('Invalid token');
    }

    // We return the payload that will be attached to the request object
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      // Add other necessary user properties from the token
    };
  }
}
