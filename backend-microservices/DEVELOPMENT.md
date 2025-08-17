# 🛠️ Development Guide

Panduan lengkap untuk development PetPro Backend Microservices.

## 🚀 Quick Start Commands

```bash
# Setup awal (sekali saja)
./setup.sh

# Development mode
npm run dev:all

# Docker mode
docker-compose up

# Check health semua services
npm run health:check
```

## 📁 Project Structure

```
backend-microservices/
├── admin-service/          # Admin management service
├── admin-gateway/          # Admin dashboard gateway
├── auth-service/           # Authentication service
├── api-gateway/           # Main API gateway
├── booking-service/       # Booking & appointments
├── inventory-service/     # Products & inventory
├── vendor-service/        # Vendor management
├── docker-compose.yml     # Docker configuration
├── setup.sh              # Automated setup script
└── README.md             # Main documentation
```

## 🔧 Service Development

### Adding New Endpoint

1. **Create DTO** (Data Transfer Object)
```bash
cd admin-service/src/modules/user/dto
# Create update-user.dto.ts
```

2. **Update Service**
```typescript
// user.service.ts
async updateUser(id: string, updateDto: UpdateUserDto) {
  // Implementation
}
```

3. **Update Controller**
```typescript
// user.controller.ts
@Put(':id')
async updateUser(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
  return this.userService.updateUser(id, updateDto);
}
```

4. **Add Kafka Message Pattern** (if needed)
```typescript
// admin-microservice.controller.ts
@MessagePattern({ cmd: 'update_admin_user' })
async updateAdminUser(@Payload() data: { id: string; data: any; token: string }) {
  // Implementation
}
```

### Adding New Service

```bash
# Generate service skeleton
npx @nestjs/cli generate module new-service
npx @nestjs/cli generate service new-service
npx @nestjs/cli generate controller new-service

# Add to docker-compose.yml
# Add to package.json scripts
# Create .env file
```

## 🗃️ Database Operations

### Migrations

```bash
# Create migration
cd admin-service
npx sequelize-cli migration:generate --name add-new-column

# Run migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Reset database
npm run db:migrate:undo:all
npm run db:migrate
npm run db:seed
```

### Models

```typescript
// Example model
@Table({ tableName: 'users' })
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
}
```

### Seeders

```bash
# Create seeder
npx sequelize-cli seed:generate --name demo-users

# Run seeders
npm run db:seed

# Undo seeders
npm run db:seed:undo
```

## 📨 Kafka Integration

### Producer (Send Message)

```typescript
// From gateway to service
const result = await this.adminClient.send(
  { cmd: 'get_admin_users' },
  { token, query }
).toPromise();
```

### Consumer (Receive Message)

```typescript
// In service controller
@MessagePattern({ cmd: 'get_admin_users' })
async getAdminUsers(@Payload() data: { token: string; query: any }) {
  return await this.userService.findAll(data.query);
}
```

### Available Message Patterns

**Admin Service:**
- `admin_login`
- `admin_logout`
- `get_admin_users`
- `update_admin_user`
- `get_dashboard_stats`

**Inventory Service:**
- `get_all_products`
- `create_product`
- `update_product`
- `get_low_stock`
- `update_inventory`

## 🧪 Testing

### Unit Tests

```bash
# Run tests for specific service
cd admin-service
npm run test

# Run with coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Integration Tests

```bash
# E2E tests
npm run test:e2e

# All services
npm run test:all
```

### Manual API Testing

```bash
# Login
curl -X POST http://localhost:3004/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "superadmin@petpro.com", "password": "admin123"}'

# Use token for authenticated requests
curl http://localhost:3004/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🐛 Debugging

### Service Logs

```bash
# Docker logs
docker-compose logs -f admin-service
docker-compose logs -f admin-gateway

# Application logs (if using files)
tail -f admin-service/logs/combined.log
tail -f admin-service/logs/error.log
```

### Database Debugging

```bash
# Connect to PostgreSQL
docker exec -it petpro-postgres psql -U postgres

# Check databases
\l

# Connect to specific database
\c petpro_admin_dev

# Check tables
\dt

# Query data
SELECT * FROM admin_users;
```

### Kafka Debugging

```bash
# List topics
docker exec petpro-kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# Create topic manually
docker exec petpro-kafka kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic admin-events \
  --partitions 3 \
  --replication-factor 1

# Consume messages (for debugging)
docker exec petpro-kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic admin-events \
  --from-beginning
```

## 🔐 Environment Variables

### Development

```bash
# Check current environment
cat admin-service/.env

# Important variables
NODE_ENV=development
JWT_SECRET=change_in_production
DB_PASSWORD=postgres
KAFKA_BROKERS=localhost:9092
```

### Production

```bash
# Use strong secrets
JWT_SECRET=very_strong_production_secret_minimum_32_chars
DB_PASSWORD=strong_database_password

# Use production Kafka cluster
KAFKA_BROKERS=kafka1.prod:9092,kafka2.prod:9092,kafka3.prod:9092

# Enable production optimizations
NODE_ENV=production
LOG_LEVEL=error
```

## 📊 Monitoring

### Health Checks

```bash
# Check all services
curl http://localhost:3004/health
curl http://localhost:3005/health
curl http://localhost:3003/health

# Automated check
npm run health:check
```

### Performance Monitoring

```bash
# Docker stats
docker stats

# Service-specific monitoring
docker exec admin-service top
docker exec admin-service ps aux
```

## 🚀 Deployment

### Local Production Test

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Check production health
curl http://localhost:3004/health
```

### Environment Preparation

```bash
# Create production .env files
cp admin-service/.env admin-service/.env.production

# Update production values
sed -i 's/NODE_ENV=development/NODE_ENV=production/' admin-service/.env.production
sed -i 's/JWT_SECRET=.*/JWT_SECRET=production_secret/' admin-service/.env.production
```

## 📚 Useful Commands

### NestJS CLI

```bash
# Generate module
npx @nestjs/cli g module feature-name

# Generate service
npx @nestjs/cli g service feature-name

# Generate controller
npx @nestjs/cli g controller feature-name

# Generate complete resource
npx @nestjs/cli g resource feature-name
```

### Docker

```bash
# Rebuild specific service
docker-compose build --no-cache admin-service

# Restart service
docker-compose restart admin-service

# View service logs
docker-compose logs -f admin-service

# Execute command in container
docker exec -it petpro-admin-service bash
```

### Database

```bash
# Backup database
docker exec petpro-postgres pg_dump -U postgres petpro_admin_dev > backup.sql

# Restore database
cat backup.sql | docker exec -i petpro-postgres psql -U postgres petpro_admin_dev

# Reset all databases
npm run db:reset:all
```

### Git

```bash
# Check ignored files
git status --ignored

# Clean untracked files
git clean -fd

# Create feature branch
git checkout -b feature/new-feature
```

## 🔧 Performance Tips

### Database

- Use indexes on frequently queried columns
- Implement pagination for large datasets
- Use database transactions for related operations
- Monitor slow queries

### Kafka

- Use appropriate partition keys
- Monitor consumer lag
- Implement proper error handling
- Use batch processing for high throughput

### Node.js

- Use clustering for CPU-intensive tasks
- Implement proper caching strategies
- Monitor memory usage
- Use compression for API responses

## 📝 Code Standards

### TypeScript

```typescript
// Use proper typing
interface CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
}

// Use enums for constants
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Use async/await
async function getUser(id: string): Promise<User> {
  return await this.userService.findById(id);
}
```

### Error Handling

```typescript
// Use proper HTTP exceptions
throw new BadRequestException('Invalid user data');
throw new NotFoundException('User not found');
throw new UnauthorizedException('Invalid token');

// Handle Kafka errors
try {
  const result = await this.kafkaClient.send(pattern, data).toPromise();
  return result;
} catch (error) {
  throw new ServiceUnavailableException('Service communication failed');
}
```

### Logging

```typescript
// Use structured logging
this.logger.log('User created', { userId, email });
this.logger.error('Database connection failed', { error: error.message });
this.logger.warn('Rate limit exceeded', { ip, attempts });
```

---

**Happy Development! 🚀**