/**
 * Database Connection Manager
 * 
 * Manages database connections and provides connection pooling capabilities.
 */
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Configuration interfaces
interface ConnectionConfig {
  minPoolSize: number;
  maxPoolSize: number;
  connectionTimeout: number;
  idleTimeout: number;
  applicationName: string;
}

class ConnectionManager {
  private static instance: ConnectionManager;
  private _prisma: PrismaClient;
  private _config: ConnectionConfig;
  private _activeConnections: number = 0;
  private _totalRequests: number = 0;
  private _connectionErrors: number = 0;
  private _lastHealthCheck: Date = new Date();
  private _isHealthy: boolean = true;

  private constructor() {
    // Default connection pool configuration
    this._config = {
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE || '5', 10),
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '20', 10),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '60000', 10),
      applicationName: process.env.APP_NAME || 'petpro-backend'
    };

    // Create Prisma client with connection pooling configuration
    this._prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.getConnectionUrl()
        }
      },
      log: this.getLogConfig()
    });

    // Initialize connection monitoring
    this.setupConnectionMonitoring();
    
    logger.info('Database connection manager initialized', {
      minPoolSize: this._config.minPoolSize,
      maxPoolSize: this._config.maxPoolSize
    });
  }

  /**
   * Get singleton instance of connection manager
   */
  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  /**
   * Get the Prisma client instance
   */
  public get prisma(): PrismaClient {
    this._totalRequests++;
    return this._prisma;
  }

  /**
   * Get current pool statistics
   */
  public getStats() {
    return {
      activeConnections: this._activeConnections,
      maxConnections: this._config.maxPoolSize,
      utilization: this._activeConnections / this._config.maxPoolSize,
      totalRequests: this._totalRequests,
      connectionErrors: this._connectionErrors,
      lastHealthCheck: this._lastHealthCheck,
      isHealthy: this._isHealthy
    };
  }

  /**
   * Check if database is healthy
   */
  public async checkHealth() {
    try {
      this._lastHealthCheck = new Date();
      
      // Run a simple query to verify connection
      await this._prisma.$queryRaw`SELECT 1 as healthy`;
      
      this._isHealthy = true;
      return {
        status: 'healthy',
        timestamp: this._lastHealthCheck,
        connectionPoolStats: this.getStats()
      };
    } catch (error: any) {
      this._isHealthy = false;
      this._connectionErrors++;
      
      logger.error('Database health check failed', {
        error: error.message,
        timestamp: this._lastHealthCheck
      });
      
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: this._lastHealthCheck,
        connectionPoolStats: this.getStats()
      };
    }
  }

  /**
   * Gracefully shutdown the connection pool
   */
  public async disconnect() {
    try {
      await this._prisma.$disconnect();
      logger.info('Database connection pool closed successfully');
      return true;
    } catch (error: any) {
      logger.error('Error disconnecting from database', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Create a new Prisma client with custom configuration
   * Useful for specific use cases like admin operations
   */
  public createCustomClient(options: {
    timeout?: number;
    maxConnections?: number;
    logLevel?: string[];
  }) {
    const customClient = new PrismaClient({
      datasources: {
        db: {
          url: this.getConnectionUrl({
            connectionTimeout: options.timeout || this._config.connectionTimeout,
            maxPoolSize: options.maxConnections || this._config.maxPoolSize
          })
        }
      },
      log: options.logLevel ? 
        options.logLevel.map(level => ({ emit: 'event', level })) : 
        this.getLogConfig()
    });
    
    logger.info('Created custom database client', {
      timeout: options.timeout,
      maxConnections: options.maxConnections,
      logLevel: options.logLevel
    });
    
    return customClient;
  }

  /**
   * Get enhanced connection URL with connection pool parameters
   */
  private getConnectionUrl(overrides?: Partial<ConnectionConfig>): string {
    const config = { ...this._config, ...overrides };
    const baseUrl = process.env.DATABASE_URL || '';
    
    if (!baseUrl) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }
    
    // Add connection pool parameters to URL if not already present
    const url = new URL(baseUrl);
    
    // Add pool size parameters
    if (!url.searchParams.has('pool_min_size')) {
      url.searchParams.set('pool_min_size', config.minPoolSize.toString());
    }
    
    if (!url.searchParams.has('pool_max_size')) {
      url.searchParams.set('pool_max_size', config.maxPoolSize.toString());
    }
    
    // Add timeout parameters
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', 
        Math.floor(config.connectionTimeout / 1000).toString());
    }
    
    // Add application name for better server-side logging
    if (!url.searchParams.has('application_name')) {
      url.searchParams.set('application_name', config.applicationName);
    }
    
    return url.toString();
  }

  /**
   * Setup logging configuration for Prisma client
   */
  private getLogConfig() {
    const logLevels: string[] = (process.env.PRISMA_LOG_LEVELS || 'error,warn')
      .split(',')
      .map(level => level.trim());

    return logLevels.map(level => ({
      emit: 'event',
      level: level as any
    }));
  }

  /**
   * Setup connection monitoring for Prisma client
   */
  private setupConnectionMonitoring() {
    // Monitor connections
    this._prisma.$on('query', () => {
      this._activeConnections++;
      
      setTimeout(() => {
        this._activeConnections = Math.max(0, this._activeConnections - 1);
      }, 100); // Approximate query duration
    });

    // Monitor connection errors
    this._prisma.$on('error', (e: any) => {
      this._connectionErrors++;
      
      logger.error('Prisma connection error', {
        error: e.message,
        target: e.target,
        activeConnections: this._activeConnections
      });
    });

    // Periodic health check
    const healthCheckInterval = parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '60000', 10);
    setInterval(() => this.checkHealth(), healthCheckInterval);
  }
}

// Export singleton instance
export const connectionManager = ConnectionManager.getInstance();

// Export Prisma instance for convenience
export const prisma = connectionManager.prisma;
