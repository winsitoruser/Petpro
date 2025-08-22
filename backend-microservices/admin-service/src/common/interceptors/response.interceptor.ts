import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
       if (data && data.meta) {
          const { meta, data: innerData, rows, ...rest } = data;
          return {
            success: true,
            data: innerData || rows || rest,
            error: null,
            meta,
          };
        }

        return {
          success: true,
          data,
          error: null,
          meta: null,
        };
      })
    );
  }
}
