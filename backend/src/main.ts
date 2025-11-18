import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * bootstrap(): Application entry point
 *
 * What happens here:
 * 1. Create NestJS application instance
 * 2. Configure global pipes, filters, interceptors
 * 3. Start HTTP server on specified port
 *
 * ValidationPipe:
 * - Automatically validates DTOs using class-validator decorators
 * - If validation fails, returns 400 Bad Request
 * - whitelist: true → Strips properties not in DTO (security)
 * - transform: true → Converts plain objects to DTO class instances
 *
 * Example: LoginDto has @MinLength(6) on password
 * - Request: { password: "123" }
 * - ValidationPipe checks: "123".length >= 6 ? NO
 * - Response: 400 Bad Request with error details
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,  // Remove properties not in DTO
      transform: true,  // Transform to DTO class instances
    }),
  );

  // Start server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
