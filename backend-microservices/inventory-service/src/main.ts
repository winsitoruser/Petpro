import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DatabaseSeeder } from './database/seeders/index';

async function bootstrap() {
  // Check if we're running in seed mode
  const args = process.argv.slice(2);
  const seedMode = args.includes('--seed');
  
  // Create the main HTTP application
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  // Apply validation pipe globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Connect as Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'inventory-service',
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      },
      consumer: {
        groupId: 'inventory-service-group',
      },
    },
  });
  
  // Start all microservices
  await app.startAllMicroservices();
  
  // Check if seed mode is active
  if (seedMode) {
    try {
      const databaseSeeder = app.get(DatabaseSeeder);
      await databaseSeeder.seed();
      console.log('Database seeding completed successfully!');
      await app.close();
      process.exit(0);
    } catch (error) {
      console.error('Error during database seeding:', error);
      await app.close();
      process.exit(1);
    }
  } else {
    // Start HTTP server in normal mode
    const httpPort = process.env.PORT || 3003;
    await app.listen(httpPort);
    
    console.log(`Inventory Service running on port ${httpPort} with Kafka microservice`);
  }
}

bootstrap();
