import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    @Inject('ADMIN_SERVICE') private adminClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.adminClient.connect();
  }

  async login(loginDto: any): Promise<any> {
    return this.adminClient.send({ cmd: 'admin_login' }, loginDto).toPromise();
  }

  async logout(token: string): Promise<any> {
    return this.adminClient.send({ cmd: 'admin_logout' }, { token }).toPromise();
  }

  async getProfile(token: string): Promise<any> {
    return this.adminClient.send({ cmd: 'admin_profile' }, { token }).toPromise();
  }

  async createAdmin(createAdminDto: any, token: string): Promise<any> {
    return this.adminClient.send({ cmd: 'create_admin' }, { createAdminDto, token }).toPromise();
  }
}