import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class InventoryService {
  private readonly inventoryServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.inventoryServiceUrl = this.configService.get<string>('INVENTORY_SERVICE_URL') || 'http://localhost:3003';
  }

  async getProducts(token: string, query: any) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: query,
      })
    );
    return response.data;
  }

  async getProductById(id: string, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async createProduct(data: any, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.post(`${this.inventoryServiceUrl}/api/v1/products`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async updateProduct(id: string, data: any, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.put(`${this.inventoryServiceUrl}/api/v1/products/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async deleteProduct(id: string, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.delete(`${this.inventoryServiceUrl}/api/v1/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }

  async getInventory(token: string, query: any) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.get(`${this.inventoryServiceUrl}/api/v1/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
        params: query,
      })
    );
    return response.data;
  }

  async updateInventory(id: string, data: any, token: string) {
    const response: AxiosResponse = await firstValueFrom(
      this.httpService.put(`${this.inventoryServiceUrl}/api/v1/inventory/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    return response.data;
  }
}