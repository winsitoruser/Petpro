import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../models/user.model';
import { RefreshToken } from '../../models/refresh-token.model';
import { LoginDto } from '../../dto/login.dto';
import { RegisterDto } from '../../dto/register.dto';
import { RefreshTokenDto } from '../../dto/refresh-token.dto';
import { TokenResponseDto } from '../../dto/token-response.dto';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(RefreshToken)
    private readonly refreshTokenModel: typeof RefreshToken,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const { email, password, firstName, lastName, role } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      // Create the new user
      const user = await this.userModel.create({
        email,
        password, // Will be hashed by model hooks
        firstName,
        lastName,
        role: role || 'customer', // Default to customer if no role provided
      });

      // Generate tokens
      return this.generateTokens(user);
    } catch (error) {
      this.logger.error('Failed to register user', error, 'AuthService');
      throw new BadRequestException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto, ipAddress?: string, deviceInfo?: string): Promise<TokenResponseDto> {
    const { email, password } = loginDto;

    // Find the user
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if the account is active
    if (!user.active) {
      throw new UnauthorizedException('Account is disabled. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    return this.generateTokens(user, ipAddress, deviceInfo);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify the token is valid
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if token exists in database
      const tokenRecord = await this.refreshTokenModel.findOne({
        where: { token: refreshToken },
        include: [User],
      });

      if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.isExpired()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get the user from the token
      const user = tokenRecord.user;

      // Check if user is active
      if (!user.active) {
        throw new UnauthorizedException('Account is disabled');
      }

      // Revoke the old refresh token
      tokenRecord.isRevoked = true;
      await tokenRecord.save();

      // Generate new tokens
      return this.generateTokens(user, tokenRecord.ipAddress, tokenRecord.deviceInfo);
    } catch (error) {
      this.logger.error('Failed to refresh token', error, 'AuthService');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<boolean> {
    try {
      // Find the token
      const token = await this.refreshTokenModel.findOne({
        where: { userId, token: refreshToken },
      });

      if (token) {
        // Revoke the token
        token.isRevoked = true;
        await token.save();
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to logout user', error, 'AuthService');
      return false;
    }
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userModel.findByPk(userId);
    if (!user || !user.active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  private async generateTokens(
    user: User,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<TokenResponseDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    // Access token expiration time
    const expiresIn = parseInt(
      this.configService.get<string>('JWT_EXPIRATION') || '86400',
      10,
    );
    
    // Generate JWT access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresIn,
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      { ...payload, tokenId: uuidv4() },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '604800', // Default 7 days
      },
    );

    // Calculate expiry date for refresh token
    const refreshExpiresIn = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '604800',
      10,
    );
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + refreshExpiresIn);

    // Store refresh token in database
    await this.refreshTokenModel.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      ipAddress,
      deviceInfo,
    });

    // Return token response
    return {
      accessToken,
      refreshToken,
      expiresIn,
      userId: user.id,
      role: user.role,
    };
  }
}
