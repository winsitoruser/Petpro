import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  
  constructor(private configService: ConfigService) {
    const environment = this.configService.get<string>('NODE_ENV') || 'development';
    const isProduction = environment === 'production';
    
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      isProduction 
        ? winston.format.json() 
        : winston.format.printf(({ level, message, timestamp, ms, context, ...meta }) => {
            return `${timestamp} [${level.toUpperCase()}] [${context || 'Application'}]${ms} ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            }`;
          })
    );
    
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        ),
      }),
    ];

    // Add file transport in production
    if (isProduction) {
      transports.push(
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        }),
      );
    }

    this.logger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: logFormat,
      defaultMeta: { service: 'auth-service' },
      transports,
    });
  }

  log(message: string, context?: string, meta?: Record<string, any>): void {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: Error, context?: string, meta?: Record<string, any>): void {
    this.logger.error(message, { 
      context, 
      stack: trace?.stack,
      ...meta 
    });
  }

  warn(message: string, context?: string, meta?: Record<string, any>): void {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, any>): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: Record<string, any>): void {
    this.logger.verbose(message, { context, ...meta });
  }
}
