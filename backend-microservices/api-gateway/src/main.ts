import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Get configuration service
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  app.useLogger(logger);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Apply global middleware
  app.use(helmet.default());
  app.use(cookieParser());
  
  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Apply global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  
  // Set up Swagger documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('PetPro API Gateway')
      .setDescription('PetPro Platform API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
  
  // Start the server
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
