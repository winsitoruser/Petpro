import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/logger/logger.service';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);

  // Run migrations automatically
  try {
    const sequelize = app.get(Sequelize);
    await sequelize.authenticate();
    loggerService.log('Database connection established successfully', 'Bootstrap');
    
    const { execSync } = require('child_process');
    const path = require('path');
    
    // Run migrations
    const configPath = path.join(process.cwd(), 'sequelize.config.js');
    const migrationsPath = path.join(process.cwd(), 'src/database/migrations');
    
    loggerService.log('Running database migrations...', 'Bootstrap');
    execSync(`npx sequelize-cli db:migrate --config ${configPath} --migrations-path ${migrationsPath}`, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
    });
    loggerService.log('Database migrations completed successfully', 'Bootstrap');
  } catch (error) {
    loggerService.error('Database migration failed: ' + error.message, error, 'Bootstrap');
    process.exit(1);
  }
  
  // Global prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || '/api/v1';
  app.setGlobalPrefix(apiPrefix);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(loggerService));
  
  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  
  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PetPro Auth Service API')
    .setDescription('API documentation for the PetPro Auth microservice')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  // Start the server
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  
  loggerService.log(`Auth service is running on port ${port}`, 'Bootstrap');
  loggerService.log(`Swagger documentation available at ${apiPrefix}/docs`, 'Bootstrap');
}

bootstrap();
