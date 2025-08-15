import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '../common/logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    
    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        const errorObj = errorResponse as Record<string, any>;
        message = errorObj.message || message;
        error = errorObj.error || error;
      } else if (typeof errorResponse === 'string') {
        message = errorResponse;
      }
    } 
    // Handle Sequelize database errors
    else if (exception['name'] === 'SequelizeValidationError' || 
             exception['name'] === 'SequelizeUniqueConstraintError') {
      status = HttpStatus.BAD_REQUEST;
      message = exception['errors'].map(err => err.message).join(', ');
      error = 'Validation Error';
    }
    // Handle other known error types (can be extended for different error types)
    else if (exception['code'] === 'ECONNREFUSED') {
      message = 'Database connection error';
      error = 'Database Error';
    }

    // Log the error with appropriate level based on status
    const logMethod = status >= 500 ? 'error' : 'warn';
    const reqInfo = {
      path: request.url,
      method: request.method,
      headers: request.headers,
      query: request.query,
      body: request.body,
      ip: request.ip,
    };

    this.logger[logMethod](
      `Exception: ${message}`,
      exception instanceof Error ? exception.stack : null,
      'AllExceptionsFilter'
    );
    this.logger.debug(`Request: ${JSON.stringify(reqInfo)}`, 'AllExceptionsFilter');

    // Return standardized error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }
}
