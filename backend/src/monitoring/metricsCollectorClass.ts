/**
 * MetricsCollector Class
 * 
 * Provides an object-oriented interface to the metrics collection functionality
 */
import * as promClient from 'prom-client';
import * as metricsCollector from './metricsCollector';
import { Counter, Gauge, Histogram } from 'prom-client';

/**
 * MetricsCollector provides methods to record metrics for database and cache operations
 */
export class MetricsCollector {
  /**
   * Increments a counter metric
   * 
   * @param name - The name of the counter metric
   * @param labels - The labels to associate with this increment
   * @param value - The value to increment by (default: 1)
   */
  public incrementCounter(name: string, labels: Record<string, string>, value: number = 1): void {
    switch (name) {
      case 'repository_queries_total':
        metricsCollector.dbMetrics.queryTotal.inc(labels, value);
        break;
      case 'repository_query_errors_total':
        metricsCollector.dbMetrics.errorQueries.inc(labels, value);
        break;
      case 'repository_cache_operations_total':
        metricsCollector.cacheMetrics.cacheOperation.inc({
          ...labels,
          operation: labels.operation || 'get'
        }, value);
        break;
      case 'repository_cache_hits_total':
        metricsCollector.cacheMetrics.cacheHit.inc(labels, value);
        break;
      case 'repository_cache_misses_total':
        metricsCollector.cacheMetrics.cacheMiss.inc(labels, value);
        break;
      case 'repository_cache_errors_total':
        metricsCollector.cacheMetrics.cacheOperationError.inc({
          ...labels,
          operation: labels.operation || 'get',
          error_type: labels.error_type || 'Unknown'
        }, value);
        break;
      case 'repository_cache_invalidations_total':
        metricsCollector.cacheMetrics.cacheOperation.inc({
          ...labels,
          operation: 'del'
        }, value);
        break;
      case 'repository_transactions_total':
        metricsCollector.dbMetrics.transactionTotal.inc({ result: labels.result || 'commit' }, value);
        break;
      case 'repository_transaction_errors_total':
        metricsCollector.dbMetrics.transactionTotal.inc({ result: 'rollback' }, value);
        break;
      default:
        // For other counters, try to find them in the registry
        const metric = metricsCollector.getMetricsRegistry().getSingleMetric(name);
        if (metric && metric instanceof Counter) {
          metric.inc(labels, value);
        }
    }
  }

  /**
   * Decrements a gauge metric
   * 
   * @param name - The name of the gauge metric
   * @param labels - The labels to associate with this decrement
   * @param value - The value to decrement by (default: 1)
   */
  public decrementCounter(name: string, labels: Record<string, string>, value: number = 1): void {
    const metric = metricsCollector.getMetricsRegistry().getSingleMetric(name);
    if (metric && metric instanceof Gauge) {
      metric.dec(labels, value);
    }
  }

  /**
   * Sets a gauge metric to a specific value
   * 
   * @param name - The name of the gauge metric
   * @param labels - The labels to associate with this value
   * @param value - The value to set
   */
  public observeGauge(name: string, labels: Record<string, string>, value: number): void {
    switch (name) {
      case 'redis_memory_usage_bytes':
      case 'redis_memory_fragmentation_ratio':
      case 'redis_memory_peak_bytes':
      case 'redis_memory_limit_bytes':
      case 'redis_memory_usage_percentage':
      case 'redis_keys_total':
      case 'cache_keys_per_prefix':
      case 'redis_avg_key_size_bytes':
      case 'redis_max_key_size_bytes':
      case 'redis_min_key_size_bytes':
      case 'redis_key_size_stddev':
      case 'local_cache_size':
      case 'local_cache_memory_bytes':
        // Try to find the gauge in registry
        const metric = metricsCollector.getMetricsRegistry().getSingleMetric(name);
        if (metric && metric instanceof Gauge) {
          metric.set(labels, value);
        } else {
          // Create new gauge on demand if doesn't exist
          const newGauge = new promClient.Gauge({
            name: name,
            help: `Gauge metric for ${name}`,
            labelNames: Object.keys(labels),
            registers: [metricsCollector.getMetricsRegistry()]
          });
          newGauge.set(labels, value);
        }
        break;
      default:
        // For other gauges, try to find them in the registry
        const otherMetric = metricsCollector.getMetricsRegistry().getSingleMetric(name);
        if (otherMetric && otherMetric instanceof Gauge) {
          otherMetric.set(labels, value);
        }
    }
  }

  /**
   * Observes a value in a histogram metric
   * 
   * @param name - The name of the histogram metric
   * @param labels - The labels to associate with this observation
   * @param value - The value to observe
   */
  public observeHistogram(name: string, labels: Record<string, string>, value: number): void {
    switch (name) {
      case 'repository_query_duration_seconds':
        metricsCollector.dbMetrics.queryDuration.observe(labels, value);
        break;
      case 'repository_transaction_duration_seconds':
        metricsCollector.dbMetrics.transactionDuration.observe({ result: labels.result || 'commit' }, value);
        break;
      case 'repository_cache_duration_seconds':
        metricsCollector.cacheMetrics.cacheDuration.observe({
          ...labels,
          operation: labels.operation || 'get'
        }, value);
        break;
      default:
        // For other histograms, try to find them in the registry
        const metric = metricsCollector.getMetricsRegistry().getSingleMetric(name);
        if (metric && metric instanceof Histogram) {
          metric.observe(labels, value);
        }
    }
  }

  /**
   * Starts a timer for a histogram metric
   * 
   * @param name - The name of the histogram metric
   * @param labels - The labels to associate with this timer
   * @returns A function that, when called, will stop the timer and record the duration
   */
  public startTimer(name: string, labels: Record<string, string>): () => number {
    switch (name) {
      case 'repository_query_duration_seconds':
        return metricsCollector.dbMetrics.queryDuration.startTimer(labels);
      case 'repository_transaction_duration_seconds':
        return metricsCollector.dbMetrics.transactionDuration.startTimer({ result: labels.result || 'commit' });
      case 'repository_cache_duration_seconds':
        return metricsCollector.cacheMetrics.cacheDuration.startTimer({
          ...labels,
          operation: labels.operation || 'get'
        });
      default:
        // For other histograms, try to find them in the registry
        const metric = metricsCollector.getMetricsRegistry().getSingleMetric(name);
        if (metric && metric instanceof Histogram) {
          return metric.startTimer(labels);
        }
        // Return a no-op timer if not found
        const startTime = process.hrtime();
        return () => {
          const [seconds, nanoseconds] = process.hrtime(startTime);
          return seconds + nanoseconds / 1e9;
        };
    }
  }

  /**
   * Measures a database query and records metrics
   * 
   * @param operation - The database operation type
   * @param model - The Prisma model name
   * @param method - The repository method name
   * @param queryFn - The function that executes the query
   * @returns The result of the query function
   */
  public async measureQuery<T>(
    operation: string,
    model: string,
    method: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    return metricsCollector.measureQuery(operation, model, method, queryFn);
  }

  /**
   * Measures a database transaction and records metrics
   * 
   * @param transactionFn - The function that executes the transaction
   * @returns The result of the transaction function
   */
  public async measureTransaction<T>(
    transactionFn: () => Promise<T>
  ): Promise<T> {
    return metricsCollector.measureTransaction(transactionFn);
  }

  /**
   * Measures a cache operation and records metrics
   * 
   * @param operation - The cache operation type
   * @param repository - The repository name
   * @param method - The repository method name
   * @param cacheFn - The function that executes the cache operation
   * @returns The result of the cache function
   */
  public async measureCache<T>(
    operation: 'get' | 'set' | 'del',
    repository: string,
    method: string,
    cacheFn: () => Promise<T>
  ): Promise<T> {
    return metricsCollector.measureCache(operation, repository, method, cacheFn);
  }

  /**
   * Gets all metrics in Prometheus format
   * 
   * @returns A string containing all metrics in Prometheus format
   */
  public async getMetrics(): Promise<string> {
    return metricsCollector.getMetrics();
  }

  /**
   * Gets the metrics registry
   * 
   * @returns The metrics registry
   */
  public getMetricsRegistry(): promClient.Registry {
    return metricsCollector.getMetricsRegistry();
  }

  /**
   * Records Redis latency metrics
   * 
   * @param latencyMs - The latency in milliseconds
   * @param labels - Optional additional labels
   */
  public recordRedisLatency(latencyMs: number, labels: Record<string, string> = {}): void {
    const latencySec = latencyMs / 1000; // Convert to seconds for Prometheus standards
    this.observeHistogram('redis_operation_latency_seconds', labels, latencySec);
  }

  /**
   * Increments cache hit counter
   * 
   * @param source - The cache source ('redis', 'local', etc)
   * @param repository - The repository name
   * @param method - The repository method name
   */
  public incrementCacheHits(source: string, repository: string, method: string): void {
    this.incrementCounter('repository_cache_hits_total', {
      source,
      repository,
      method
    });
  }

  /**
   * Increments cache miss counter
   * 
   * @param repository - The repository name
   * @param method - The repository method name
   */
  public incrementCacheMisses(repository: string, method: string): void {
    this.incrementCounter('repository_cache_misses_total', {
      repository,
      method
    });
  }
}
