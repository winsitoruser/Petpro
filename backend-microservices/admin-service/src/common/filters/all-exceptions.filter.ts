import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error occurred',
      details: null,
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: any = exception.getResponse();
      errorResponse = {
        code: res?.code || 'HTTP_ERROR',
        message: res?.message || exception.message,
        details: res?.details || null,
      };
    }

    response.status(status).json({
      success: false,
      data: null,
      error: errorResponse,
      meta: null,
    });
  }
}
