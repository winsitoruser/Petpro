import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserClientService } from './services/user-client.service';

/**
 * Shared Module for Cross-Service Communication
 * Provides services for communicating with other microservices
 */
@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 2,
    }),
    ConfigModule,
  ],
  providers: [
    UserClientService,
  ],
  exports: [
    UserClientService,
  ],
})
export class SharedModule {}