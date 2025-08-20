import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { HttpCacheInterceptor } from './interceptors/http-cache.interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { RedisModule } from './modules/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingModule } from './modules/booking/booking.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { VendorModule } from './modules/vendor/vendor.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Cache module (optional fallback)
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 1000, // max items in cache
      isGlobal: true,
    }),
    
    // Common modules
    LoggerModule,
    RedisModule, // Optional Redis for pub/sub and caching
    
    // Service modules
    AuthModule,
    BookingModule,
    InventoryModule,
    VendorModule,
  ],
  providers: [
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule {}
