import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  CacheInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;
    
    // Don't cache if it's not a GET request
    if (request.method !== 'GET') {
      return undefined;
    }

    // Don't cache if the request has authorization headers (user-specific data)
    if (request.headers.authorization) {
      return undefined;
    }

    // Create a cache key based on the URL and query parameters
    const url = httpAdapter.getRequestUrl(request);
    return `${url}`;
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.trackBy(context);
    if (!cacheKey) {
      return next.handle();
    }
    
    return super.intercept(context, next);
  }
}
