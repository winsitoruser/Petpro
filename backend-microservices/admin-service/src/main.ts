import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  // Create HTTP app
  const app = await NestFactory.create(AppModule);

  // Run migrations automatically
  try {
    const sequelize = app.get(Sequelize);
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    const { execSync } = require('child_process');
    const path = require('path');

    // Run migrations
    const configPath = path.join(process.cwd(), 'sequelize.config.js');
    const migrationsPath = path.join(process.cwd(), 'src/database/migrations');

    console.log('Running database migrations...');
    execSync(`npx sequelize-cli db:migrate --config ${configPath} --migrations-path ${migrationsPath}`, {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
    });
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error.message);
    process.exit(1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Redis service communication handled via RedisModule (if needed)

  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`Admin service running on port ${port}`);
}
bootstrap();