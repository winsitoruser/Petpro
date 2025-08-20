import { NestFactory } from '@nestjs/core';
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

  // Redis service communication handled via RedisModule
  
  // Start HTTP server
  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Vendor service is running on port ${port}`);
  console.log(`Swagger documentation available at: http://${process.env.HOSTNAME || 'localhost'}:${port}/api/docs`);
}

bootstrap();
