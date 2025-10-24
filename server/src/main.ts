import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Increase payload size limit for base64 images (50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', '..', 'public'), {
    prefix: '/',
  });

  // Serve static files from assets directory
  app.useStaticAssets(join(__dirname, '..', '..', 'assets'), {
    prefix: '/assets',
  });

  // Serve debug-mahjong-references.html at root for convenience
  app.useStaticAssets(join(__dirname, '..', '..', 'assets', 'mahjong'), {
    prefix: '/',
  });

  // Enable CORS for frontend communication
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001', 'null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '127.0.0.1';
  console.log(`Attempting to start server on http://${host}:${port}`);
  await app.listen(port, host);
  console.log(`🚀 Backend server is running on: http://localhost:${port}`);
  console.log('🌐 Frontend dev server (Vite): http://localhost:3000');
}
bootstrap();
