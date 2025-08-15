import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // Load environment variables based on NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  dotenv.config({ path: `.env.${nodeEnv}` });

  // Create the NestJS application
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Configure validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('PetPro Vendor Service API')
    .setDescription('The Vendor Service API documentation')
    .setVersion('1.0')
    .addTag('vendors')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable CORS
  app.enableCors();

  // Connect as microservice using RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: process.env.VENDOR_QUEUE || 'vendor_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  // Start all microservices
  await app.startAllMicroservices();
  
  // Start HTTP server
  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Vendor service is running on port ${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
