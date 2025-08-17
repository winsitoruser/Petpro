import { Injectable, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AdminService {
  constructor(
    @Inject('ADMIN_SERVICE') private adminClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.adminClient.connect();
  }

  async getUsers(token: string, query: any) {
    return this.adminClient.send({ cmd: 'get_admin_users' }, { token, query }).toPromise();
  }

  async getUserById(id: string, token: string) {
    return this.adminClient.send({ cmd: 'get_admin_user' }, { id, token }).toPromise();
  }

  async updateUser(id: string, data: any, token: string) {
    return this.adminClient.send({ cmd: 'update_admin_user' }, { id, data, token }).toPromise();
  }

  async deactivateUser(id: string, token: string) {
    return this.adminClient.send({ cmd: 'deactivate_admin_user' }, { id, token }).toPromise();
  }

  async activateUser(id: string, token: string) {
    return this.adminClient.send({ cmd: 'activate_admin_user' }, { id, token }).toPromise();
  }

  async getDashboardStats(token: string) {
    return this.adminClient.send({ cmd: 'get_dashboard_stats' }, { token }).toPromise();
  }

  async getRecentActivity(token: string, query: any) {
    return this.adminClient.send({ cmd: 'get_recent_activity' }, { token, query }).toPromise();
  }

  async getSystemHealth(token: string) {
    return this.adminClient.send({ cmd: 'get_system_health' }, { token }).toPromise();
  }

}