import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import helmet from 'helmet';
import { DatabaseSeeder } from './database/seeders/index';

async function bootstrap() {
  // Check if we're running in seed mode
  const args = process.argv.slice(2);
  const seedMode = args.includes('--seed');
  
  // Create the main HTTP application
  const app = await NestFactory.create(AppModule);
  
  // Apply global middleware
  app.use(helmet());
  app.enableCors();
  
  // Apply validation pipe globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Connect as a microservice for internal communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.INVENTORY_SERVICE_HOST || '0.0.0.0',
      port: parseInt(process.env.INVENTORY_SERVICE_PORT) || 3003,
    },
  });
  
  // Setup Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Pet Pro Inventory Service API')
    .setDescription('API documentation for the Pet Pro Inventory Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
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
    const httpPort = process.env.HTTP_PORT || 3002;
    await app.listen(httpPort);
    
    console.log(`Inventory Service is running on: ${await app.getUrl()}`);
    console.log(`TCP Microservice is running on: ${process.env.INVENTORY_SERVICE_HOST || '0.0.0.0'}:${process.env.INVENTORY_SERVICE_PORT || 3003}`);
  }
}

bootstrap();
