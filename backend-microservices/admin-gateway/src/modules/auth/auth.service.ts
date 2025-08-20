import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService {
  private readonly adminServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.adminServiceUrl = this.configService.get<string>('ADMIN_SERVICE_URL') || 'http://localhost:3005';
  }

  async login(loginDto: any): Promise<any> {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post(`${this.adminServiceUrl}/api/v1/auth/login`, loginDto)
    );
    return response.data;
  }

  async logout(token: string): Promise<any> {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post(`${this.adminServiceUrl}/api/v1/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async getProfile(token: string): Promise<any> {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.adminServiceUrl}/api/v1/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async createAdmin(createAdminDto: any, token: string): Promise<any> {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post(`${this.adminServiceUrl}/api/v1/auth/create-admin`, createAdminDto, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }
}