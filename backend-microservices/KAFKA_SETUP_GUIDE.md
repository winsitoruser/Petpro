# 🚀 PetPro Kafka Setup & Development Guide

Panduan lengkap untuk setup Kafka, menjalankan aplikasi, dan membuat endpoint baru untuk inventory stock management.

## 📋 Daftar Isi

1. [Install & Setup Kafka](#1-install--setup-kafka)
2. [Running All Services](#2-running-all-services)
3. [Creating New Inventory Stock Endpoints](#3-creating-new-inventory-stock-endpoints)
4. [Testing the Implementation](#4-testing-the-implementation)

---

## 1. Install & Setup Kafka

### Option A: Using Docker (Recommended)

```bash
# 1. Start Kafka dengan Docker Compose
cd /home/thomas/Documents/Code/Petpro/backend-microservices
docker-compose up -d kafka postgres redis

# 2. Verify Kafka is running
docker ps | grep kafka

# 3. Check Kafka logs
docker logs petpro-kafka

# 4. Create topics manually (optional - services will auto-create)
docker exec petpro-kafka kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic inventory-events \
  --partitions 3 \
  --replication-factor 1

# 5. List all topics
docker exec petpro-kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

### Option B: Native Installation

```bash
# 1. Download Kafka
wget https://downloads.apache.org/kafka/2.13-3.6.0/kafka_2.13-3.6.0.tgz
tar -xzf kafka_2.13-3.6.0.tgz
cd kafka_2.13-3.6.0

# 2. Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# 3. Start Kafka (in new terminal)
bin/kafka-server-start.sh config/server.properties

# 4. Create topics
bin/kafka-topics.sh --create --topic inventory-events \
  --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
```

---

## 2. Running All Services

### Step 1: Install Dependencies

```bash
# Install dependencies for all services
npm run install:all

# Or install individually
cd admin-service && npm install
cd ../admin-gateway && npm install
cd ../auth-service && npm install
cd ../api-gateway && npm install
cd ../booking-service && npm install
cd ../inventory-service && npm install
cd ../vendor-service && npm install
```

### Step 2: Setup Environment Files

Pastikan semua `.env` files sudah ada dan benar:

```bash
# Check .env files
ls -la */.env

# Example .env content for inventory-service
cat inventory-service/.env
```

### Step 3: Database Setup

```bash
# Run migrations for services that need it
npm run db:migrate:all

# Seed initial data
npm run db:seed:all
```

### Step 4: Start All Services

```bash
# Option 1: Start all with Docker
docker-compose up

# Option 2: Start all in development mode
npm run dev:all

# Option 3: Start services individually (recommended for development)
# Terminal 1 - Infrastructure
docker-compose up -d postgres kafka redis

# Terminal 2 - Inventory Service
cd inventory-service && npm run start:dev

# Terminal 3 - Admin Gateway
cd admin-gateway && npm run start:dev

# Terminal 4 - API Gateway
cd api-gateway && npm run start:dev

# Terminal 5 - Auth Service
cd auth-service && npm run start:dev
```

### Step 5: Verify Services

```bash
# Check service health
curl http://localhost:3003/health  # Inventory Service
curl http://localhost:3004/health  # Admin Gateway
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Auth Service

# Check API documentation
open http://localhost:3003/api/docs  # Inventory Service
open http://localhost:3004/api/admin/docs  # Admin Gateway
open http://localhost:3000/api/docs  # API Gateway
```

---

## 3. Creating New Inventory Stock Endpoints

### Step 1: Create Stock Management DTO

```bash
cd inventory-service/src/modules/inventory/dto
```

Create `manage-stock.dto.ts`:

```typescript
import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StockOperation {
  ADD = 'add',
  REMOVE = 'remove',
  SET = 'set'
}

export class ManageStockDto {
  @ApiProperty({ description: 'Product ID' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Stock operation type', enum: StockOperation })
  @IsEnum(StockOperation)
  operation: StockOperation;

  @ApiProperty({ description: 'Quantity to add/remove/set', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ description: 'Reason for stock change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class StockResponseDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  previousQuantity: number;

  @ApiProperty()
  newQuantity: number;

  @ApiProperty()
  operation: StockOperation;

  @ApiProperty()
  reason?: string;

  @ApiProperty()
  updatedAt: Date;
}
```

### Step 2: Add Stock Management to Inventory Service

Update `inventory-service/src/modules/inventory/inventory.service.ts`:

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Inventory } from '../../models/inventory.model';
import { Product } from '../../models/product.model';
import { ManageStockDto, StockOperation, StockResponseDto } from './dto/manage-stock.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory)
    private inventoryModel: typeof Inventory,
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  async manageStock(manageStockDto: ManageStockDto): Promise<StockResponseDto> {
    const { productId, operation, quantity, reason } = manageStockDto;

    // Find existing inventory
    let inventory = await this.inventoryModel.findOne({
      where: { productId },
      include: [{ model: Product, as: 'product' }]
    });

    if (!inventory) {
      // Check if product exists
      const product = await this.productModel.findByPk(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Create new inventory record
      inventory = await this.inventoryModel.create({
        productId,
        quantity: 0,
        minimumStock: 5,
        maximumStock: 1000,
        location: 'main-warehouse'
      });
    }

    const previousQuantity = inventory.quantity;
    let newQuantity: number;

    // Calculate new quantity based on operation
    switch (operation) {
      case StockOperation.ADD:
        newQuantity = previousQuantity + quantity;
        break;
      case StockOperation.REMOVE:
        newQuantity = previousQuantity - quantity;
        if (newQuantity < 0) {
          throw new BadRequestException('Cannot reduce stock below zero');
        }
        break;
      case StockOperation.SET:
        newQuantity = quantity;
        break;
      default:
        throw new BadRequestException('Invalid stock operation');
    }

    // Update inventory
    await inventory.update({ 
      quantity: newQuantity,
      lastUpdated: new Date()
    });

    return {
      productId,
      previousQuantity,
      newQuantity,
      operation,
      reason,
      updatedAt: new Date()
    };
  }

  async getStockLevel(productId: string): Promise<any> {
    const inventory = await this.inventoryModel.findOne({
      where: { productId },
      include: [{ model: Product, as: 'product' }]
    });

    if (!inventory) {
      throw new NotFoundException('Inventory not found for this product');
    }

    return {
      productId,
      productName: inventory.product?.name,
      currentStock: inventory.quantity,
      minimumStock: inventory.minimumStock,
      maximumStock: inventory.maximumStock,
      stockStatus: this.getStockStatus(inventory.quantity, inventory.minimumStock),
      location: inventory.location,
      lastUpdated: inventory.updatedAt
    };
  }

  private getStockStatus(current: number, minimum: number): string {
    if (current === 0) return 'OUT_OF_STOCK';
    if (current <= minimum) return 'LOW_STOCK';
    return 'IN_STOCK';
  }
}
```

### Step 3: Add Controller Methods

Update `inventory-service/src/modules/inventory/inventory.controller.ts`:

```typescript
import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { ManageStockDto, StockResponseDto } from './dto/manage-stock.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('stock/manage')
  @ApiOperation({ summary: 'Manage inventory stock (add/remove/set)' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully', type: StockResponseDto })
  async manageStock(@Body() manageStockDto: ManageStockDto): Promise<StockResponseDto> {
    return this.inventoryService.manageStock(manageStockDto);
  }

  @Get('stock/:productId')
  @ApiOperation({ summary: 'Get current stock level for a product' })
  @ApiResponse({ status: 200, description: 'Stock level retrieved successfully' })
  async getStockLevel(@Param('productId') productId: string) {
    return this.inventoryService.getStockLevel(productId);
  }
}
```

### Step 4: Add Microservice Controller (Kafka)

Update `inventory-service/src/modules/microservice/inventory.microservice.controller.ts`:

```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InventoryService } from '../inventory/inventory.service';
import { ManageStockDto } from '../inventory/dto/manage-stock.dto';

@Controller()
export class InventoryMicroserviceController {
  constructor(private readonly inventoryService: InventoryService) {}

  @MessagePattern({ cmd: 'manage_inventory_stock' })
  async manageStock(@Payload() data: { stockData: ManageStockDto; token: string }) {
    try {
      // TODO: Validate token here if needed
      return await this.inventoryService.manageStock(data.stockData);
    } catch (error) {
      throw error;
    }
  }

  @MessagePattern({ cmd: 'get_stock_level' })
  async getStockLevel(@Payload() data: { productId: string; token: string }) {
    try {
      return await this.inventoryService.getStockLevel(data.productId);
    } catch (error) {
      throw error;
    }
  }

  @MessagePattern({ cmd: 'get_low_stock_products' })
  async getLowStockProducts(@Payload() data: { token: string }) {
    try {
      // Implementation for getting low stock products
      return { message: 'Low stock products endpoint to be implemented' };
    } catch (error) {
      throw error;
    }
  }
}
```

### Step 5: Add User Gateway Endpoint (API Gateway)

Create `api-gateway/src/modules/inventory/inventory.controller.ts`:

```typescript
import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('user-inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  private inventoryClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.inventoryClient = ClientProxyFactory.create({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'api-gateway-inventory',
          brokers: this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
        },
        consumer: {
          groupId: 'api-gateway-inventory-consumer',
        },
      },
    });
  }

  @Get('stock/:productId')
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Get stock level for a product (User access)' })
  @ApiResponse({ status: 200, description: 'Stock level retrieved successfully' })
  async getStockLevel(@Param('productId') productId: string, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    return this.inventoryClient.send(
      { cmd: 'get_stock_level' },
      { productId, token }
    ).toPromise();
  }

  @Get('products/low-stock')
  @Roles('customer', 'admin')
  @ApiOperation({ summary: 'Get products with low stock (User access)' })
  @ApiResponse({ status: 200, description: 'Low stock products retrieved successfully' })
  async getLowStockProducts(@Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    return this.inventoryClient.send(
      { cmd: 'get_low_stock_products' },
      { token }
    ).toPromise();
  }
}
```

### Step 6: Add Admin Gateway Endpoint

Create `admin-gateway/src/modules/inventory/inventory.controller.ts`:

```typescript
import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

class ManageStockDto {
  productId: string;
  operation: 'add' | 'remove' | 'set';
  quantity: number;
  reason?: string;
}

@ApiTags('admin-inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminInventoryController {
  private inventoryClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.inventoryClient = ClientProxyFactory.create({
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'admin-gateway-inventory',
          brokers: this.configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
        },
        consumer: {
          groupId: 'admin-gateway-inventory-consumer',
        },
      },
    });
  }

  @Post('stock/manage')
  @Roles('admin', 'inventory_manager')
  @ApiOperation({ summary: 'Manage inventory stock (Admin only)' })
  @ApiResponse({ status: 200, description: 'Stock managed successfully' })
  async manageStock(@Body() manageStockDto: ManageStockDto, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    return this.inventoryClient.send(
      { cmd: 'manage_inventory_stock' },
      { stockData: manageStockDto, token }
    ).toPromise();
  }

  @Get('stock/:productId')
  @Roles('admin', 'inventory_manager')
  @ApiOperation({ summary: 'Get detailed stock information (Admin access)' })
  @ApiResponse({ status: 200, description: 'Stock information retrieved successfully' })
  async getStockLevel(@Param('productId') productId: string, @Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    return this.inventoryClient.send(
      { cmd: 'get_stock_level' },
      { productId, token }
    ).toPromise();
  }

  @Get('products/low-stock')
  @Roles('admin', 'inventory_manager')
  @ApiOperation({ summary: 'Get products with low stock (Admin view)' })
  @ApiResponse({ status: 200, description: 'Low stock products retrieved successfully' })
  async getLowStockProducts(@Req() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    return this.inventoryClient.send(
      { cmd: 'get_low_stock_products' },
      { token }
    ).toPromise();
  }
}
```

### Step 7: Register Controllers in Modules

Update module files to include the new controllers:

`api-gateway/src/modules/inventory/inventory.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';

@Module({
  controllers: [InventoryController],
})
export class InventoryModule {}
```

`admin-gateway/src/modules/inventory/inventory.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { AdminInventoryController } from './inventory.controller';

@Module({
  controllers: [AdminInventoryController],
})
export class InventoryModule {}
```

---

## 4. Testing the Implementation

### Step 1: Start All Services

```bash
# Start infrastructure
docker-compose up -d postgres kafka redis

# Start services
npm run dev:all
```

### Step 2: Get Authentication Token

```bash
# Login to get admin token
curl -X POST http://localhost:3004/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@petpro.com",
    "password": "admin123"
  }'

# Save the token
export ADMIN_TOKEN="your-jwt-token-here"
```

### Step 3: Test Admin Stock Management

```bash
# 1. Add stock (Admin only)
curl -X POST http://localhost:3004/api/admin/inventory/stock/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "productId": "product-123",
    "operation": "add",
    "quantity": 50,
    "reason": "New shipment received"
  }'

# 2. Get stock level (Admin)
curl -X GET http://localhost:3004/api/admin/inventory/stock/product-123 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Remove stock (Admin only)
curl -X POST http://localhost:3004/api/admin/inventory/stock/manage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "productId": "product-123",
    "operation": "remove",
    "quantity": 10,
    "reason": "Damaged items removed"
  }'
```

### Step 4: Test User Gateway Access

```bash
# 1. Get stock level (User access - read only)
curl -X GET http://localhost:3000/api/inventory/stock/product-123 \
  -H "Authorization: Bearer $USER_TOKEN"

# 2. Get low stock products (User access)
curl -X GET http://localhost:3000/api/inventory/products/low-stock \
  -H "Authorization: Bearer $USER_TOKEN"

# Note: Users cannot manage stock - only view
```

### Step 5: Verify Kafka Messages

```bash
# Monitor Kafka topics
docker exec petpro-kafka kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic inventory-events \
  --from-beginning
```

## 🎯 API Endpoints Summary

### Admin Gateway (Port 3004)
- `POST /api/admin/inventory/stock/manage` - Manage stock (Admin only)
- `GET /api/admin/inventory/stock/:productId` - Get stock details (Admin)
- `GET /api/admin/inventory/products/low-stock` - Get low stock products (Admin)

### User Gateway (Port 3000)
- `GET /api/inventory/stock/:productId` - Get stock level (Read-only)
- `GET /api/inventory/products/low-stock` - Get low stock products (Read-only)

### Direct Inventory Service (Port 3003)
- `POST /inventory/stock/manage` - Direct stock management
- `GET /inventory/stock/:productId` - Direct stock query

## 🔧 Troubleshooting

### Common Issues:

1. **Kafka Connection Error**
   ```bash
   # Check Kafka status
   docker logs petpro-kafka
   
   # Restart Kafka
   docker-compose restart kafka
   ```

2. **Service Not Responding**
   ```bash
   # Check service logs
   docker logs petpro-inventory-service
   
   # Check health endpoint
   curl http://localhost:3003/health
   ```

3. **Database Issues**
   ```bash
   # Run migrations
   cd inventory-service
   npm run db:migrate
   
   # Check database connection
   docker exec petpro-postgres psql -U postgres -c "\l"
   ```

4. **Permission Errors**
   ```bash
   # Verify JWT token is valid
   # Check user roles in database
   # Ensure guards are properly configured
   ```

## 📝 Next Steps

1. **Add Validation**: Implement proper input validation for all DTOs
2. **Add Logging**: Add comprehensive logging for stock changes
3. **Add Events**: Emit events for stock changes to notify other services
4. **Add Tests**: Write unit and integration tests for new endpoints
5. **Add Monitoring**: Implement metrics and monitoring for stock operations

---

**Happy Coding! 🚀**