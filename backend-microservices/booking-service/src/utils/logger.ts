import { Logger } from '@nestjs/common';

// Simple logger wrapper for compatibility
const logger = new Logger('BookingService');

export default {
  log: (message: string, context?: any) => logger.log(message, context),
  error: (message: string, context?: any) => logger.error(message, context),
  warn: (message: string, context?: any) => logger.warn(message, context),
  debug: (message: string, context?: any) => logger.debug(message, context),
};