/**
 * Cache Manager Integration Tests
 * 
 * Tests Redis caching behavior under different availability scenarios
 */
import Redis from 'ioredis';
import NodeCache from 'node-cache';
import { CacheManager } from '../../services/cache/cacheManager';
import { MetricsCollector } from '../../monitoring/metricsCollectorClass';

// Mock Redis for controlled tests
jest.mock('ioredis');
// Mock metrics for validation
jest.mock('../../monitoring/metricsCollectorClass');

describe('CacheManager Integration Tests', () => {
  let cacheManager: CacheManager;
  let mockRedis: jest.Mocked<Redis>;
  let mockMetricsCollector: jest.Mocked<MetricsCollector>;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock Redis
    mockRedis = new Redis() as jest.Mocked<Redis>;
    (Redis as jest.Mock).mockImplementation(() => mockRedis);
    
    // Setup mock MetricsCollector
    mockMetricsCollector = new MetricsCollector() as jest.Mocked<MetricsCollector>;
    (MetricsCollector as jest.Mock).mockImplementation(() => mockMetricsCollector);
    
    // Initialize cache manager with the mocks
    cacheManager = new CacheManager('redis://localhost:6379', {
      enableLocalCache: true,
      localCacheTtl: 60,
      enableRedis: true,
      defaultTtl: 300,
      healthCheckIntervalMs: 5000,
      maxReconnectAttempts: 3
    });
    
    // Replace the Redis instance with our mock
    (cacheManager as any).redis = mockRedis;
    // Replace the metrics collector with our mock
    (cacheManager as any).metricsCollector = mockMetricsCollector;
  });
  
  afterEach(() => {
    // Clean up
    cacheManager.close();
  });

  describe('Basic Cache Operations', () => {
    test('should set and get values from cache', async () => {
      // Setup Redis mock to return the value
      mockRedis.get.mockResolvedValue(JSON.stringify({ id: '123', name: 'Test' }));
      
      // Set a value
      await cacheManager.set('test:key', { id: '123', name: 'Test' });
      
      // Get the value
      const result = await cacheManager.get('test:key');
      
      // Assertions
      expect(mockRedis.set).toHaveBeenCalled();
      expect(result).toEqual({ id: '123', name: 'Test' });
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_hit_total',
        expect.any(Object)
      );
    });
    
    test('should delete values from cache', async () => {
      // Setup
      mockRedis.del.mockResolvedValue(1);
      
      // Action
      const result = await cacheManager.del('test:key');
      
      // Assertions
      expect(mockRedis.del).toHaveBeenCalledWith('test:key');
      expect(result).toBe(true);
    });
    
    test('should delete values by pattern', async () => {
      // Setup Redis scan to return keys
      mockRedis.scan.mockResolvedValueOnce(['0', ['test:key1']]);
      mockRedis.scan.mockResolvedValueOnce(['0', ['test:key2']]);
      mockRedis.del.mockResolvedValue(2);
      
      // Action
      const result = await cacheManager.delByPattern('test:*');
      
      // Assertions
      expect(mockRedis.scan).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalledWith('test:key1', 'test:key2');
      expect(result).toBe(2);
    });
  });

  describe('Redis Availability Scenarios', () => {
    test('should fall back to local cache when Redis is unavailable', async () => {
      // Setup Redis to be unavailable
      mockRedis.get.mockRejectedValue(new Error('Connection failed'));
      
      // Set up local cache spy
      const localCacheSpy = jest.spyOn(cacheManager as any, 'localCache', 'get');
      
      // Manually set a value in the local cache
      (cacheManager as any).localCache.set('test:key', { id: '123', name: 'Test' });
      
      // Try to get the value - should fall back to local cache
      const result = await cacheManager.get('test:key');
      
      // Assertions
      expect(result).toEqual({ id: '123', name: 'Test' });
      expect(cacheManager.isRedisAvailable()).toBe(false);
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'redis_availability_change_total',
        expect.objectContaining({ status: 'unavailable' })
      );
    });
    
    test('should reconnect to Redis after it becomes available again', async () => {
      // Setup Redis to fail first, then succeed
      let connectionAttempts = 0;
      const eventHandlers: Record<string, Function> = {};
      
      // Mock the Redis on method to capture event handlers
      mockRedis.on.mockImplementation((event: string, handler: Function) => {
        eventHandlers[event] = handler;
        return mockRedis;
      });
      
      // Make Redis unavailable
      (cacheManager as any).redisAvailable = false;
      
      // Manually trigger Redis ready event to simulate reconnection
      if (eventHandlers['ready']) {
        eventHandlers['ready']();
      }
      
      // Verify Redis is now available
      expect(cacheManager.isRedisAvailable()).toBe(true);
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'redis_availability_change_total',
        expect.objectContaining({ status: 'available' })
      );
    });
  });

  describe('Health Check System', () => {
    test('should detect when Redis becomes unavailable', async () => {
      // Setup
      (cacheManager as any).redisAvailable = true;
      mockRedis.ping.mockRejectedValue(new Error('Connection lost'));
      
      // Run health check manually
      await (cacheManager as any).checkHealth();
      
      // Assertions
      expect(cacheManager.isRedisAvailable()).toBe(false);
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'redis_availability_change_total',
        expect.objectContaining({ status: 'unavailable' })
      );
    });
    
    test('should record Redis latency metrics during health checks', async () => {
      // Setup successful ping
      mockRedis.ping.mockResolvedValue('PONG');
      
      // Run health check
      await (cacheManager as any).checkHealth();
      
      // Verify metrics were recorded
      expect(mockMetricsCollector.observeHistogram).toHaveBeenCalledWith(
        'redis_latency_ms',
        expect.any(Object),
        expect.any(Number)
      );
    });
  });

  describe('Retry and Backoff Logic', () => {
    test('should retry operations with exponential backoff', async () => {
      // Setup Redis to fail then succeed
      mockRedis.get
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(JSON.stringify({ id: '123', name: 'Test' }));
      
      // Mock setTimeout to execute immediately
      jest.useFakeTimers();
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = (fn: Function) => {
        fn();
        return {} as any;
      };
      
      // Attempt to get value
      const result = await cacheManager.get('test:key', {
        repository: 'TestRepo',
        method: 'testMethod',
        retry: true,
        maxRetries: 3
      });
      
      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
      
      // Assertions
      expect(mockRedis.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ id: '123', name: 'Test' });
    });
    
    test('should not exceed maximum retry attempts', async () => {
      // Setup Redis to always fail
      mockRedis.get.mockRejectedValue(new Error('Persistent failure'));
      
      // Mock setTimeout to execute immediately
      jest.useFakeTimers();
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = (fn: Function) => {
        fn();
        return {} as any;
      };
      
      // Attempt to get value with max 2 retries
      await cacheManager.get('test:key', {
        repository: 'TestRepo',
        method: 'testMethod',
        retry: true,
        maxRetries: 2
      });
      
      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
      
      // Should have attempted original + 2 retries = 3 calls
      expect(mockRedis.get).toHaveBeenCalledTimes(3);
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_error_total',
        expect.any(Object)
      );
    });
  });

  describe('Cache Invalidation', () => {
    test('should invalidate both Redis and local cache', async () => {
      // Setup
      mockRedis.scan.mockResolvedValueOnce(['0', ['test:key1', 'test:key2']]);
      mockRedis.del.mockResolvedValue(2);
      
      // Add items to local cache
      (cacheManager as any).localCache.set('test:key1', 'value1');
      (cacheManager as any).localCache.set('test:key2', 'value2');
      
      // Invalidate by pattern
      const result = await cacheManager.delByPattern('test:*');
      
      // Verify Redis calls
      expect(mockRedis.scan).toHaveBeenCalled();
      expect(mockRedis.del).toHaveBeenCalled();
      
      // Verify local cache is also cleared
      expect((cacheManager as any).localCache.get('test:key1')).toBeUndefined();
      expect((cacheManager as any).localCache.get('test:key2')).toBeUndefined();
      
      // Verify metrics
      expect(mockMetricsCollector.incrementCounter).toHaveBeenCalledWith(
        'repository_cache_invalidations_total',
        expect.any(Object)
      );
    });
  });
});
