import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { RedisPubSubService } from './redis-pubsub.service';
import { ServiceRegistryService } from './service-registry.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService, RedisPubSubService, ServiceRegistryService],
  exports: [RedisService, RedisPubSubService, ServiceRegistryService],
})
export class RedisModule {}