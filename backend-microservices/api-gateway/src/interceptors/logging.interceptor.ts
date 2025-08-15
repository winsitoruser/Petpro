import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || '';
    
    // Log the request
    this.logger.log(
      `Request ${method} ${url} ${JSON.stringify(body)}`,
      `${context.getClass().name}/${context.getHandler().name}`,
      { requestId, ip, userAgent }
    );

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          // Log successful response
          this.logger.log(
            `Response ${method} ${url} ${responseTime}ms`,
            `${context.getClass().name}/${context.getHandler().name}`,
            { requestId, responseTime }
          );
        },
        error: (err) => {
          const responseTime = Date.now() - startTime;
          // Log error response
          this.logger.error(
            `Response ${method} ${url} ${responseTime}ms`,
            err,
            `${context.getClass().name}/${context.getHandler().name}`,
            { requestId, responseTime }
          );
        },
      })
    );
  }
}
