import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-expections.filters';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    'https://wareon.vercel.app',
  ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.setGlobalPrefix('api/v1')
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
}

bootstrap();

