import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Application entry point
 *
 * Configures global validation, Swagger documentation, and starts HTTP server
 * ValidationPipe: whitelist removes extra properties, transform converts to DTO instances
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO (security)
      transform: true, // Transform to DTO class instances
    }),
  );

  // Swagger/OpenAPI configuration - auto-generated interactive API docs
  const config = new DocumentBuilder()
    .setTitle('Retailer Sales Platform API')
    .setDescription(
      'Backend API for managing retailers, sales representatives, and reference data. ' +
        'Features include JWT authentication, role-based access control, pagination, ' +
        'search & filters, Redis caching, and CSV import.',
    )
    .setVersion('1.0')
    .addBearerAuth() // Enables JWT authentication in Swagger UI
    .build();

  // Create and mount Swagger UI at /api endpoint
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start HTTP server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api`,
  );
}

bootstrap();
