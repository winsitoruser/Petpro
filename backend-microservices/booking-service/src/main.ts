import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggerService } from './common/logger/logger.service';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get custom logger service
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Run migrations automatically
  try {
    const sequelize = app.get(Sequelize);
    await sequelize.authenticate();
    logger.log('Database connection established successfully', 'Bootstrap');
    
    const { execSync } = require('child_process');
    const path = require('path');
    
    // Run migrations
    const configPath = path.join(process.cwd(), 'sequelize.config.js');
    const migrationsPath = path.join(process.cwd(), 'src/database/migrations');
    
    logger.log('Running database migrations...', 'Bootstrap');
    execSync(`npx sequelize-cli db:migrate --config ${configPath} --migrations-path ${migrationsPath}`, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
    });
    logger.log('Database migrations completed successfully', 'Bootstrap');
  } catch (error) {
    logger.error('Database migration failed: ' + error.message, error, 'Bootstrap');
    process.exit(1);
  }

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  // Set global prefix from env or default
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000'];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('PetPro Booking API')
    .setDescription('API for managing pet service bookings')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('booking')
    .addTag('health')
    .addTag('service')
    .addTag('availability')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // Start the server
  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  logger.log(`Booking service running on port ${port}`, 'Bootstrap');
  logger.log(`Swagger docs available at ${apiPrefix}/docs`, 'Bootstrap');
}

bootstrap();
