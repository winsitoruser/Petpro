/**
 * Query Logger and Analyzer
 * 
 * Provides advanced query logging, performance tracking and analysis.
 */
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Query statistics storage
interface QueryStats {
  count: number;
  totalDuration: number;
  min: number;
  max: number;
  slow: number; // count of queries exceeding threshold
}

interface QueryRecord {
  model: string;
  operation: string;
  duration: number;
  timestamp: number;
  params?: any;
  query?: string;
  stack?: string;
}

class QueryLogger {
  private static instance: QueryLogger;
  private stats: Map<string, QueryStats>;
  private recentQueries: QueryRecord[];
  private slowThreshold: number;
  private enabled: boolean;
  private maxRecords: number;
  private captureStack: boolean;

  private constructor() {
    this.stats = new Map();
    this.recentQueries = [];
    this.slowThreshold = parseInt(process.env.SLOW_QUERY_THRESHOLD_MS || '100', 10);
    this.enabled = process.env.ENABLE_QUERY_LOGGING === 'true';
    this.maxRecords = parseInt(process.env.MAX_QUERY_LOG_RECORDS || '1000', 10);
    this.captureStack = process.env.CAPTURE_QUERY_STACK_TRACE === 'true';
    
    // Periodic reporting of query statistics
    if (this.enabled) {
      const reportInterval = parseInt(process.env.QUERY_STATS_REPORT_INTERVAL || '300000', 10); // 5 minutes
      setInterval(() => this.reportStats(), reportInterval);
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): QueryLogger {
    if (!QueryLogger.instance) {
      QueryLogger.instance = new QueryLogger();
    }
    return QueryLogger.instance;
  }

  /**
   * Configure Prisma client to log queries
   * @param prisma Prisma client to configure
   */
  public attachToPrisma(prisma: PrismaClient): void {
    if (!this.enabled) return;
    
    prisma.$on('query', (e: any) => {
      this.logQuery({
        model: this.extractModel(e.query),
        operation: this.extractOperation(e.query),
        duration: e.duration,
        timestamp: Date.now(),
        params: e.params,
        query: e.query,
        stack: this.captureStack ? new Error().stack : undefined
      });
    });
    
    logger.info('Query logger attached to Prisma client', {
      slowThreshold: this.slowThreshold,
      captureStack: this.captureStack
    });
  }

  /**
   * Log a query and update statistics
   * @param record Query record to log
   */
  public logQuery(record: QueryRecord): void {
    if (!this.enabled) return;
    
    const key = `${record.model}.${record.operation}`;
    
    // Update stats
    if (!this.stats.has(key)) {
      this.stats.set(key, {
        count: 0,
        totalDuration: 0,
        min: Number.MAX_VALUE,
        max: 0,
        slow: 0
      });
    }
    
    const stats = this.stats.get(key)!;
    stats.count++;
    stats.totalDuration += record.duration;
    stats.min = Math.min(stats.min, record.duration);
    stats.max = Math.max(stats.max, record.duration);
    
    if (record.duration > this.slowThreshold) {
      stats.slow++;
      
      // Log slow queries immediately
      logger.warn('Slow query detected', {
        model: record.model,
        operation: record.operation,
        duration: record.duration,
        threshold: this.slowThreshold,
        params: record.params ? JSON.stringify(record.params).substring(0, 200) : undefined,
        query: record.query
      });
    }
    
    // Store recent queries with fixed buffer size
    this.recentQueries.push(record);
    if (this.recentQueries.length > this.maxRecords) {
      this.recentQueries.shift();
    }
  }

  /**
   * Get top slow queries
   * @param limit Maximum number of queries to return
   * @returns List of slow queries
   */
  public getSlowQueries(limit = 10): QueryRecord[] {
    return [...this.recentQueries]
      .filter(q => q.duration > this.slowThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get query statistics
   */
  public getQueryStats() {
    const result: Record<string, any> = {};
    
    for (const [key, stats] of this.stats.entries()) {
      result[key] = {
        ...stats,
        avg: stats.count ? Math.round(stats.totalDuration / stats.count) : 0,
        slowPercentage: stats.count ? Math.round((stats.slow / stats.count) * 100) : 0
      };
    }
    
    return result;
  }

  /**
   * Get full query analysis
   */
  public getFullAnalysis() {
    return {
      stats: this.getQueryStats(),
      slowQueries: this.getSlowQueries(10),
      totalQueries: this.recentQueries.length,
      slowQueriesCount: this.recentQueries.filter(q => q.duration > this.slowThreshold).length,
      averageDuration: this.recentQueries.length ?
        this.recentQueries.reduce((sum, q) => sum + q.duration, 0) / this.recentQueries.length :
        0
    };
  }

  /**
   * Reset query statistics
   */
  public resetStats() {
    this.stats.clear();
    this.recentQueries = [];
    logger.info('Query statistics reset');
  }

  /**
   * Report query statistics to log
   */
  private reportStats() {
    const analysis = this.getFullAnalysis();
    
    logger.info('Query statistics report', {
      totalQueries: analysis.totalQueries,
      slowQueries: analysis.slowQueriesCount,
      avgDuration: Math.round(analysis.averageDuration),
      topSlow: analysis.slowQueries.slice(0, 3).map(q => ({
        model: q.model,
        operation: q.operation,
        duration: q.duration
      }))
    });
  }

  /**
   * Extract model name from SQL query
   */
  private extractModel(query: string): string {
    // Simple heuristic to extract table name
    const tableMatches = query.match(/FROM\s+"([^"]+)"/i);
    if (tableMatches && tableMatches[1]) {
      return tableMatches[1].replace(/s$/, ''); // Remove plural 's'
    }
    return 'unknown';
  }

  /**
   * Extract operation type from SQL query
   */
  private extractOperation(query: string): string {
    if (query.startsWith('SELECT')) return 'findMany';
    if (query.startsWith('INSERT')) return 'create';
    if (query.startsWith('UPDATE')) return 'update';
    if (query.startsWith('DELETE')) return 'delete';
    return 'unknown';
  }
}

// Export singleton instance
export const queryLogger = QueryLogger.getInstance();
