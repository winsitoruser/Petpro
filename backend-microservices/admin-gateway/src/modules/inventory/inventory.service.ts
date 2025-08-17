import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class InventoryService {
  constructor(
    @Inject('INVENTORY_SERVICE') private inventoryClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.inventoryClient.connect();
  }

  async getProducts(token: string, query: any) {
    return this.inventoryClient.send({ cmd: 'get_all_products' }, query).toPromise();
  }

  async getProductById(id: string, token: string) {
    return this.inventoryClient.send({ cmd: 'get_product' }, id).toPromise();
  }

  async createProduct(data: any, token: string) {
    return this.inventoryClient.send({ cmd: 'create_product' }, data).toPromise();
  }

  async updateProduct(id: string, data: any, token: string) {
    return this.inventoryClient.send({ cmd: 'update_product' }, { id, updateProductDto: data }).toPromise();
  }

  async deleteProduct(id: string, token: string) {
    return this.inventoryClient.send({ cmd: 'delete_product' }, id).toPromise();
  }

  async getInventory(token: string, query: any) {
    return this.inventoryClient.send({ cmd: 'get_low_stock' }, {}).toPromise();
  }

  async updateInventory(id: string, data: any, token: string) {
    return this.inventoryClient.send({ cmd: 'update_inventory' }, { productId: id, updateInventoryDto: data }).toPromise();
  }
}