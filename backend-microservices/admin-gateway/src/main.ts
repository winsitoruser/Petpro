import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  
  app.enableCors({
    origin: process.env.ADMIN_FRONTEND_URL || 'http://localhost:3010',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api/admin');

  const config = new DocumentBuilder()
    .setTitle('PetPro Admin Gateway API')
    .setDescription('Admin gateway for PetPro microservices via Kafka')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/admin/docs', app, document);

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Admin gateway running on port ${port}`);
}
bootstrap();