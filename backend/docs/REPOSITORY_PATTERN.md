# Repository Pattern & Monitoring

## Overview

This document provides a comprehensive guide to the Repository Pattern implementation in PetPro, including the integrated monitoring and metrics collection system.

## Table of Contents

1. [Repository Pattern Implementation](#repository-pattern-implementation)
2. [Enhanced Repository](#enhanced-repository)
3. [Metrics Collection](#metrics-collection)
4. [Caching Strategy](#caching-strategy)
5. [Monitoring Setup](#monitoring-setup)
6. [Repository Testing](#repository-testing)
7. [Best Practices](#best-practices)

## Repository Pattern Implementation

The repository pattern serves as an abstraction layer between the data access code and the business logic in PetPro. This implementation provides several key benefits:

- **Separation of concerns**: Business logic does not need to know how data is retrieved or persisted
- **Centralized data access logic**: Consistent handling of database operations
- **Testability**: Easy to mock repositories for unit tests
- **Maintainability**: Changes to database structure only need to be updated in one place

### Repository Structure

Each repository in PetPro follows this general structure:

```typescript
export class EntityRepository extends EnhancedRepository<Entity> {
  // Repository name for metrics and logging
  protected readonly repositoryName = 'EntityRepository';
  
  // Model name for metrics and logging
  protected readonly modelName = 'Entity';
  
  // Cache TTL
  private readonly cacheTtl = 300; // 5 minutes
  
  constructor() {
    super();
  }
  
  // Specific entity methods with metrics and caching
  async findById(id: string): Promise<Entity | null> {
    // Implementation with metrics and caching
  }
  
  // Other repository methods...
}
```

## Enhanced Repository

The `EnhancedRepository` base class provides common functionality for all repositories:

- **Automatic metrics collection** for all database operations
- **Standardized caching** with TTL management
- **Transaction handling** with metrics
- **Error tracking and reporting**
- **Health check functionality**

### Key Methods

- `executeQuery`: Wraps Prisma client calls with metrics collection
- `executeTransaction`: Provides transaction with metrics for complex operations
- `getFromCacheOrDb`: Implements cache-aside pattern with metrics
- `invalidateCache`: Handles cache invalidation on data mutations
- `checkHealth`: Verifies database connectivity

## Metrics Collection

The metrics collection system uses Prometheus to track various aspects of repository performance:

### Query Metrics

- **repository_queries_total** - Total count of database queries by repository and method
- **repository_query_errors_total** - Count of database query errors
- **repository_query_duration_seconds** - Histogram of query duration

### Cache Metrics

- **repository_cache_operations_total** - Total count of cache operations
- **repository_cache_hits_total** - Count of cache hits
- **repository_cache_misses_total** - Count of cache misses
- **repository_cache_errors_total** - Count of cache errors
- **repository_cache_invalidations_total** - Count of cache invalidations

### Transaction Metrics

- **repository_transactions_total** - Total count of database transactions
- **repository_transaction_errors_total** - Count of transaction errors
- **repository_transaction_duration_seconds** - Histogram of transaction duration

## Caching Strategy

The repository pattern integrates Redis caching with the following strategy:

### Cache Key Design

Cache keys follow a consistent pattern:
- `entity:id`: For single entity by ID
- `entity:relation:id`: For entity with specific relations
- `entities:filter:value`: For filtered collections

### TTL Strategy

Different data types have appropriate TTLs:
- Frequently accessed reference data: 1 hour
- User profiles and related entities: 5 minutes
- Search results: 60 seconds

### Invalidation Strategy

Cache invalidation occurs:
- On any write operation (create/update/delete)
- Using key patterns to invalidate related entities
- With selective invalidation to minimize cache churn

## Monitoring Setup

PetPro includes a complete monitoring stack using:

### Components

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and alerting
- **PostgreSQL Exporter**: Database metrics
- **Redis Exporter**: Cache metrics
- **Node Exporter**: Host system metrics

### Dashboards

Three main dashboards are available:

1. **Database Performance**: PostgreSQL metrics including query performance, connection counts, and buffer usage
2. **Redis Cache Performance**: Hit rates, memory usage, and eviction metrics
3. **Repository Metrics**: Application-specific metrics for repository operations

### Alerts

Pre-configured alerts include:

- High query error rates
- Slow queries (95th percentile above threshold)
- Low cache hit rates
- Database or Redis connectivity issues
- High transaction error rates
- Long-running transactions

## Repository Testing

Repository testing strategy includes:

### Unit Tests

- Mock Prisma client to test repository logic
- Verify cache interactions and invalidation logic
- Test error handling and edge cases

### Integration Tests

- Use test database to verify actual database interactions
- Test cache hit/miss behavior with actual Redis instance
- Verify metrics collection with test Prometheus instance

### Load Testing

- Test repository performance under load
- Verify caching efficiency with high concurrency
- Monitor metrics during load tests to identify bottlenecks

## Best Practices

When working with repositories:

1. **Always extend `EnhancedRepository`** to ensure metrics and caching
2. **Use meaningful cache keys** that follow the established pattern
3. **Invalidate cache properly** when mutating data
4. **Add appropriate TTL** based on data access patterns
5. **Include repository name and method** in all metrics
6. **Monitor dashboards regularly** to identify performance issues
7. **Keep transactions short** to minimize database contention
8. **Add appropriate indexes** based on query patterns

## Conclusion

The Repository Pattern with integrated metrics and monitoring provides a solid foundation for data access in PetPro. By following these patterns and practices, we ensure a robust, observable, and high-performance backend with appropriate caching and metrics collection.
