import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Create the main HTTP application
  const app = await NestFactory.create(AppModule);

  // Run migrations automatically
  try {
    const sequelize = app.get(Sequelize);
    await sequelize.authenticate();
    logger.log('Database connection established successfully');
    
    const { execSync } = require('child_process');
    const path = require('path');
    
    // Run migrations
    const configPath = path.join(process.cwd(), 'sequelize.config.js');
    const migrationsPath = path.join(process.cwd(), 'src/database/migrations');
    
    logger.log('Running database migrations...');
    execSync(`npx sequelize-cli db:migrate --config ${configPath} --migrations-path ${migrationsPath}`, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
    });
    logger.log('Database migrations completed successfully');
  } catch (error) {
    logger.error('Database migration failed:', error.message);
    process.exit(1);
  }
  
  app.enableCors();
  
  // Apply validation pipe globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // API prefix
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix);
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('PetPro Inventory Service API')
    .setDescription('Inventory and Product management service for PetPro')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  
  // Start HTTP server
  const httpPort = process.env.PORT || 3003;
  await app.listen(httpPort);
  
  logger.log(`🚀 Inventory Service running on port ${httpPort}`);
  logger.log(`📚 Swagger docs available at http://localhost:${httpPort}${apiPrefix}/docs`);
}

bootstrap();
