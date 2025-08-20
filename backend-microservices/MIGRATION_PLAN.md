# 🚀 SAFE USER DATA MIGRATION PLAN

## PHASE 1: CREATE USER SERVICE CLIENT (NO BREAKING CHANGES)

### 1.1 Create User Service Interface
```typescript
// shared/interfaces/user.interface.ts
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'customer' | 'vendor' | 'admin';
  profileImage?: string;
  businessName?: string;
  averageRating?: number;
  totalReviews?: number;
}

// shared/services/user-client.service.ts
export class UserClientService {
  async getUserById(userId: string): Promise<IUser> {
    // Call auth-service API or use event bus
  }
  
  async getUsersByIds(userIds: string[]): Promise<IUser[]> {
    // Batch get users
  }
}
```

### 1.2 Update Services to Use Client (GRADUAL)
- Keep existing User models for now
- Add UserClientService alongside existing code
- Test both approaches work

## PHASE 2: UPDATE MODELS (SAFE TYPESCRIPT CHANGES)

### 2.1 Booking Service Changes
```typescript
// BEFORE: Full User model with relations
export class User extends Model {
  // ... full user data
  @HasMany(() => Review)
  customerReviews: Review[];
}

// AFTER: Keep User model but mark as deprecated
// Add UserReference for new code
export interface UserReference {
  id: string;
  // Cached essential fields only
  firstName?: string;
  lastName?: string;
}

// Update relations to be optional and load via service
export class Review extends Model {
  @Column()
  customerId: string;
  
  @Column()
  vendorId: string;
  
  // Remove direct relations, use service calls instead
  async getCustomer(): Promise<IUser> {
    return userClient.getUserById(this.customerId);
  }
}
```

### 2.2 Vendor Service Changes
```typescript
// Remove duplicate User model completely
// Keep only vendor-specific data
export class VendorProfile extends Model {
  @Column()
  userId: string; // Reference to auth-service user
  
  @Column()
  businessLicense: string;
  
  @Column()
  serviceAreas: string[];
  
  // Load user data via service
  async getUser(): Promise<IUser> {
    return userClient.getUserById(this.userId);
  }
}
```

## PHASE 3: DATABASE CLEANUP (AFTER TYPESCRIPT IS SAFE)

### 3.1 Create Migration Scripts
```sql
-- Remove duplicate tables ONLY AFTER code is updated
DROP TABLE IF EXISTS "vendor_service"."users";
DROP TABLE IF EXISTS "vendor_service"."activities";  
DROP TABLE IF EXISTS "booking_service"."users";

-- Keep pets in booking service (domain-specific)
-- Keep admin_users separate (different entity)
```

### 3.2 Update Services Configuration
```typescript
// Remove User model from SequelizeModule.forFeature()
SequelizeModule.forFeature([
  // User, // REMOVE THIS
  Review,
  Booking,
  Pet,
])
```

## PHASE 4: IMPLEMENT INTER-SERVICE COMMUNICATION

### 4.1 Auth Service API Endpoints
```typescript
@Controller('api/internal/users')
export class InternalUserController {
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
  
  @Post('bulk')
  async getUsersByIds(@Body() userIds: string[]) {
    return this.userService.findByIds(userIds);
  }
}
```

### 4.2 Service Clients Implementation
```typescript
// booking-service/src/services/user-client.service.ts
@Injectable()
export class UserClientService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async getUserById(userId: string): Promise<IUser | null> {
    const authServiceUrl = this.configService.get('AUTH_SERVICE_URL');
    try {
      const response = await this.httpService.axiosRef.get(
        `${authServiceUrl}/api/internal/users/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }
}
```

## ROLLBACK STRATEGY

1. Keep original User models in git until migration is 100% tested
2. Use feature flags to switch between old/new approach
3. Database snapshots before any DROP operations
4. Gradual rollout per service

## TESTING CHECKLIST

- [ ] TypeScript compilation passes for all services
- [ ] Unit tests pass with user client mocks
- [ ] Integration tests with real user service calls
- [ ] Performance tests (API calls vs local joins)
- [ ] Error handling (auth service down scenarios)

## BENEFITS AFTER MIGRATION

✅ Single source of truth for user data
✅ No data duplication/inconsistency  
✅ Easier user management
✅ Better service boundaries
✅ Reduced database storage