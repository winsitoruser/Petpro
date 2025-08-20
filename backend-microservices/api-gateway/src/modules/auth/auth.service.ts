import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL') || 'http://localhost:3001';
  }

  async login(loginDto: { email: string; password: string }) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/api/v1/auth/login`, loginDto, {
        headers: { 'Content-Type': 'application/json' },
      })
    );
    return response.data;
  }

  async register(registerDto: any) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/api/v1/users/register`, registerDto, {
        headers: { 'Content-Type': 'application/json' },
      })
    );
    return response.data;
  }

  async getProfile(userId: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/api/v1/users/${userId}`, {
        headers: { 'X-User-Id': userId },
      })
    );
    return response.data;
  }

  async updateProfile(userId: string, updateDto: any) {
    const response = await firstValueFrom(
      this.httpService.put(`${this.authServiceUrl}/api/v1/users/${userId}`, updateDto, {
        headers: { 'X-User-Id': userId, 'Content-Type': 'application/json' },
      })
    );
    return response.data;
  }

  async refreshToken(refreshTokenDto: { refresh_token: string }) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.authServiceUrl}/api/v1/auth/refresh`, refreshTokenDto, {
        headers: { 'Content-Type': 'application/json' },
      })
    );
    return response.data;
  }

  async validateUser(token: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.authServiceUrl}/api/v1/auth/validate`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
    );
    return response.data;
  }
}