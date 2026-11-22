import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { configurerSecurite } from './securite';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configurerSecurite(app);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://romain-lfr.com',
      'https://www.romain-lfr.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
