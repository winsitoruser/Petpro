import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { VendorSeeder } from './vendor.seeder';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seeder');
  
  try {
    logger.log('Starting seeding...');
    const appContext = await NestFactory.createApplicationContext(SeederModule);
    const vendorSeeder = appContext.get(VendorSeeder);
    
    logger.log('Seeding vendors and services...');
    await vendorSeeder.seed();
    
    logger.log('Seeding completed successfully.');
    await appContext.close();
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();
