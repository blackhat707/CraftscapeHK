
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

// For Vercel: export a handler creator
export async function createNestServer() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useStaticAssets(join(__dirname, '..', '..', 'public'), {
    prefix: '/',
  });
  app.useStaticAssets(join(__dirname, '..', '..', 'assets'), {
    prefix: '/assets',
  });
  app.useStaticAssets(join(__dirname, '..', '..', 'assets', 'mahjong'), {
    prefix: '/',
  });

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001', 'null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp;
}

// For local dev: keep original bootstrap
if (require.main === module) {
  (async () => {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.useStaticAssets(join(__dirname, '..', '..', 'public'), {
      prefix: '/',
    });
    app.useStaticAssets(join(__dirname, '..', '..', 'assets'), {
      prefix: '/assets',
    });
    app.useStaticAssets(join(__dirname, '..', '..', 'assets', 'mahjong'), {
      prefix: '/',
    });
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001', 'null'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });
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
  })();
}
