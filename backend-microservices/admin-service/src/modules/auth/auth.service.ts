import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { AdminUser, AdminStatus } from '../../models/admin-user.model';
import { UserSession } from '../../models/user-session.model';
import { SystemLog, LogLevel, LogCategory } from '../../models/system-log.model';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AdminUser)
    private adminUserModel: typeof AdminUser,
    @InjectModel(UserSession)
    private userSessionModel: typeof UserSession,
    @InjectModel(SystemLog)
    private systemLogModel: typeof SystemLog,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = loginDto;
    
    const user = await this.adminUserModel.findOne({
      where: { email, status: AdminStatus.ACTIVE },
    });

    if (!user || !(await user.comparePassword(password))) {
      await this.logActivity({
        level: LogLevel.WARNING,
        category: LogCategory.AUTH,
        message: `Failed login attempt for email: ${email}`,
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    
    await this.userSessionModel.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      ipAddress,
      userAgent,
    });
    
    await user.update({
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    });

    await this.logActivity({
      userId: user.id,
      level: LogLevel.INFO,
      category: LogCategory.AUTH,
      message: `User logged in: ${user.email}`,
      ipAddress,
      userAgent,
    });

    

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(userId: string, token: string) {
    await this.userSessionModel.update(
      { isActive: false },
      { where: { userId, token } },
    );

    await this.logActivity({
      userId,
      level: LogLevel.INFO,
      category: LogCategory.AUTH,
      message: 'User logged out',
    });
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const existingUser = await this.adminUserModel.findOne({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.adminUserModel.create(createAdminDto);

    await this.logActivity({
      level: LogLevel.INFO,
      category: LogCategory.USER_MANAGEMENT,
      message: `New admin user created: ${user.email}`,
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    };
  }

  private async logActivity(logData: {
    userId?: string;
    level: LogLevel;
    category: LogCategory;
    message: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.systemLogModel.create(logData);
  }
}