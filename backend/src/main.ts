import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createCorsOriginValidator } from './config/cors.config';
import { formatValidationErrors, ValidationException } from './common/pipes/validation-formatter';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable NestJS graceful shutdown hooks for clean termination
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = process.env.PORT ? Number(process.env.PORT) : configService.get<number>('app.port', 4000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const corsOrigins = configService.get<string[]>('app.corsOrigins', ['http://localhost:3000']);

  // Apply HTTP security headers via helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // API service only
      crossOriginEmbedderPolicy: false,
      hidePoweredBy: true,
    }),
  );

  // Explicitly remove X-Powered-By header to prevent technology fingerprinting
  const expressApp = app.getHttpAdapter().getInstance();
  if (expressApp && typeof expressApp.disable === 'function') {
    expressApp.disable('x-powered-by');
  }

  // Set versioned global prefix: /api/v1 (allow root '/' and '/health' for Cloud Run probes)
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/', 'health'],
  });

  // Global validation pipe with strict whitelist and formatted error details
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const details = formatValidationErrors(errors);
        return new ValidationException(details);
      },
    }),
  );

  // Safe CORS with allowlist, credentials enabled for secure session cookies
  app.enableCors({
    origin: createCorsOriginValidator(corsOrigins),
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    exposedHeaders: ['X-Trace-Id', 'x-csrf-token'],
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`Naba Academy Backend API initialized on port ${port} (host: 0.0.0.0, base prefix: /${apiPrefix})`);
}

void bootstrap();
