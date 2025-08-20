import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class AdminService {
  private readonly adminServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.adminServiceUrl = this.configService.get<string>('ADMIN_SERVICE_URL') || 'http://localhost:3005';
  }

  async getUsers(token: string, query: any) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.adminServiceUrl}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: query,
      })
    );
    return response.data;
  }

  async getUserById(id: string, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.adminServiceUrl}/api/v1/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async updateUser(id: string, data: any, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.put(`${this.adminServiceUrl}/api/v1/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async deactivateUser(id: string, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.put(`${this.adminServiceUrl}/api/v1/users/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async activateUser(id: string, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.put(`${this.adminServiceUrl}/api/v1/users/${id}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async getDashboardStats(token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.adminServiceUrl}/api/v1/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async getRecentActivity(token: string, query: any) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.adminServiceUrl}/api/v1/dashboard/activity`, {
        headers: { Authorization: `Bearer ${token}` },
        params: query,
      })
    );
    return response.data;
  }

  async getSystemHealth(token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.adminServiceUrl}/api/v1/dashboard/health`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

}