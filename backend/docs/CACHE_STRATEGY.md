# Redis Caching Strategy for PetPro

## Cache Key Design Principles

All Redis cache keys in PetPro follow a structured naming convention to ensure consistency, clarity, and efficient invalidation:

```
petpro:{environment}:{entity-type}:{operation}:{identifiers}
```

Where:
- **petpro**: Global namespace prefix for all PetPro application keys
- **environment**: `prod`, `staging`, or `dev`
- **entity-type**: The primary entity being cached (`pet`, `owner`, `appointment`, etc.)
- **operation**: The type of query/data being cached (`profile`, `list`, `search`, etc.)
- **identifiers**: Specific IDs or parameters that uniquely identify this cached data

### Examples

```
# Single entity by ID
petpro:prod:pet:byId:12345

# Collection of entities with filters
petpro:prod:appointments:upcoming:ownerId=789:limit=10

# Aggregated data
petpro:prod:metrics:monthly-visits:2025-08

# Search results
petpro:prod:search:pets:species=dog:size=MEDIUM:page=1
```

## TTL Strategy

Different types of data have different expiration policies based on:
- How frequently the data changes
- How critical it is to have the most up-to-date data
- Performance impact of regenerating the data

| Data Category | TTL (seconds) | Description |
|---------------|--------------|-------------|
| Static Reference Data | 86400 (24 hours) | Breed lists, species, etc. |
| Owner/Pet Profiles | 1800 (30 minutes) | Basic entity data |
| Relationship Data | 600 (10 minutes) | Owner-pet relationships, etc. |
| Appointment Data | 300 (5 minutes) | Scheduled appointments |
| Search Results | 60 (1 minute) | Search query results |
| Dashboard Data | 300 (5 minutes) | Dashboard metrics |
| High-Traffic Pages | 120 (2 minutes) | Frequently accessed pages |

## Key Groups for Invalidation

For efficient cache invalidation, related keys are organized into logical groups:

### Entity-Based Groups
- `petpro:{env}:pet:*:petId={id}` - All cache entries related to a specific pet
- `petpro:{env}:owner:*:ownerId={id}` - All cache entries related to a specific owner

### Operation-Based Groups
- `petpro:{env}:search:*` - All search results
- `petpro:{env}:list:*` - All list operations

## Repository-Level Cache Keys

Repositories should follow these additional guidelines:

1. **Repository-specific prefix**: Use the repository name as part of the entity-type
2. **Method-specific segment**: Include the repository method name in the operation segment
3. **Normalize parameters**: Consistent ordering of parameters in cache keys

Example:
```
petpro:prod:pet-repository:find-by-species:species=dog:limit=20
```

## Multi-Layer Caching

PetPro implements a multi-layer caching strategy:

1. **Application Memory Cache** (Node.js in-memory)
   - For very high frequency, low-value data
   - Very short TTL (10-60 seconds)
   
2. **Redis Cache** (Primary distributed cache)
   - For all data that needs to be shared between instances
   - TTL based on data characteristics
   
3. **Database Query Cache** 
   - For complex queries that are expensive to execute
   - Uses materialized views or query cache where appropriate
