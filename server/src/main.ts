import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
