import winston from 'winston';
import 'winston-daily-rotate-file';
import { LogstashTransport } from 'winston-logstash-transport';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import path from 'path';
import fs from 'fs';

// Define log levels with colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Determine the environment
const environment = process.env.NODE_ENV || 'development';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create transports array
const transports: winston.transport[] = [
  // Console Transport - always active
  new winston.transports.Console({
    level: environment === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),

  // File transport for all logs - always active
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'http',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  // File transport specifically for errors - always active
  new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Add Logstash transport in non-test environments if ELK is enabled
if (environment !== 'test' && process.env.ENABLE_ELK === 'true') {
  // Logstash TCP transport
  transports.push(
    new LogstashTransport({
      host: process.env.LOGSTASH_HOST || 'logstash',
      port: parseInt(process.env.LOGSTASH_PORT || '5000', 10),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );

  // Elasticsearch transport (optional, enabled via environment variable)
  if (process.env.LOG_TO_ELASTICSEARCH === 'true') {
    try {
      const ElasticsearchTransport = require('winston-elasticsearch').ElasticsearchTransport;
      transports.push(
        new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: process.env.ELASTICSEARCH_HOST || 'http://localhost:9200',
            maxRetries: 5,
            requestTimeout: 10000,
            sniffOnStart: false,
            auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD
            } : undefined,
            ssl: {
              rejectUnauthorized: false // Set to true in strict production environments
            }
          },
          indexPrefix: 'petpro-backend',
          indexSuffixPattern: 'YYYY.MM.DD',
          messageType: 'log',
          ensureMappingTemplate: true,
          flushInterval: 5000,
          healthCheckInterval: 30000,
          healthCheckTimeout: 10000,
          retryLimit: 5
        })
      );
    } catch (error) {
      console.error('Failed to initialize Elasticsearch transport:', error);
    }
  }
}

// Service name for better identification in the logs
const serviceName = 'petpro-backend';

// Custom format function for structured logging
const structuredLogging = winston.format((info) => {
  info.service = serviceName;
  info.environment = environment;
  info.timestamp = info.timestamp || new Date().toISOString();

  // Add request_id if available in the async local storage
  // This would require setting up context for each request
  const { requestId, userId, sessionId } = getTrackingInfo();
  if (requestId) info.request_id = requestId;
  if (userId) info.user_id = userId;
  if (sessionId) info.session_id = sessionId;

  return info;
});

// Helper function to get tracking info from async local storage (to be implemented)
function getTrackingInfo() {
  // This would be implemented with AsyncLocalStorage to track request context
  return {
    requestId: '',
    userId: '',
    sessionId: '',
  };
}

// Create the logger
const logger = winston.createLogger({
  level: environment === 'production' ? 'info' : 'debug',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    structuredLogging(),
    winston.format.json()
  ),
  defaultMeta: { service: serviceName },
  transports,
  exitOnError: false,
});

// Export logger
export default logger;

// Define a stream object for Morgan middleware
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions
export const logRequest = (req: any, res: any, next: any) => {
  logger.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    user_agent: req.get('user-agent'),
    status_code: res.statusCode,
  });
  next();
};

export const initializeLogger = () => {
  logger.info('Logger initialized', { 
    environment,
    transportsEnabled: transports.map(t => (t as any).name || 'unnamed-transport'),
  });
};
