import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * bootstrap(): Application entry point
 *
 * What happens here:
 * 1. Create NestJS application instance
 * 2. Configure global pipes, filters, interceptors
 * 3. Setup Swagger/OpenAPI documentation
 * 4. Start HTTP server on specified port
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
 *
 * Swagger Setup:
 * - Automatically generates interactive API documentation
 * - Available at: http://localhost:3000/api
 * - Reads decorators from controllers/DTOs to build docs
 * - Provides "Try it out" feature for testing endpoints
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

  /**
   * Swagger/OpenAPI Configuration
   *
   * What is Swagger?
   * - Auto-generated, interactive API documentation
   * - Lives at /api endpoint (configurable)
   * - Reads @ApiTags, @ApiOperation, @ApiResponse decorators
   * - Provides UI to test endpoints without Postman
   *
   * DocumentBuilder Pattern:
   * - Fluent API for building OpenAPI specification
   * - setTitle(): API name shown in docs
   * - setDescription(): Project description
   * - setVersion(): API version (matches package.json)
   * - addBearerAuth(): Enables "Authorize" button for JWT
   *
   * Why addBearerAuth()?
   * - Most endpoints require JWT authentication
   * - Users can click "Authorize" button in Swagger UI
   * - Enter their JWT token once
   * - All subsequent requests include: Authorization: Bearer <token>
   * - Much better UX than manually adding header each time
   *
   * Interview Q: "Why use Swagger instead of Postman collections?"
   * A: "1. Auto-generated from code (can't get out of sync)
   *     2. Self-documenting (decorators are in the code)
   *     3. Interactive (try endpoints in browser)
   *     4. Standard (OpenAPI spec is industry standard)
   *     5. No separate files to maintain"
   */
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

  /**
   * Create Swagger document
   *
   * SwaggerModule.createDocument():
   * - Scans all controllers in AppModule
   * - Reads all @Api* decorators
   * - Generates OpenAPI JSON specification
   *
   * SwaggerModule.setup():
   * - Mounts Swagger UI at specified path
   * - First param: URL path (http://localhost:3000/api)
   * - Second param: NestJS app instance
   * - Third param: OpenAPI document
   */
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start server
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api`);
}

bootstrap();
