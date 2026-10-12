import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Global, Module, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { formatValidationErrors, ValidationException } from '../src/common/pipes/validation-formatter';
import { DatabaseModule } from '../src/database/database.module';
import { DatabaseHealthService } from '../src/database/database-health.service';
import { TransactionService } from '../src/database/transaction.service';
import { RedisHealthService } from '../src/infrastructure/redis/redis-health.service';
import { S3StorageService } from '../src/infrastructure/storage/s3-storage.service';
import { IdentityModule } from '../src/modules/identity/identity.module';

@Module({})
class MockIdentityModule {}

@Global()
@Module({
  providers: [
    {
      provide: DatabaseHealthService,
      useValue: {
        check: jest.fn().mockResolvedValue('up'),
      },
    },
    {
      provide: TransactionService,
      useValue: {
        run: jest.fn((cb) => cb({})),
      },
    },
    {
      provide: RedisHealthService,
      useValue: {
        check: jest.fn().mockResolvedValue('up'),
      },
    },
    {
      provide: S3StorageService,
      useValue: {
        checkHealth: jest.fn().mockResolvedValue('unconfigured'),
      },
    },
  ],
  exports: [DatabaseHealthService, TransactionService, RedisHealthService, S3StorageService],
})
class MockDatabaseModule {}

describe('Naba Academy API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(MockDatabaseModule)
      .overrideModule(IdentityModule)
      .useModule(MockIdentityModule)
      .overrideProvider(RedisHealthService)
      .useValue({
        check: jest.fn().mockResolvedValue('up'),
      })
      .overrideProvider(S3StorageService)
      .useValue({
        checkHealth: jest.fn().mockResolvedValue('unconfigured'),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    // Enable helmet in test runner to verify header security
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        hidePoweredBy: true,
      }),
    );

    const expressApp = app.getHttpAdapter().getInstance();
    if (expressApp && typeof expressApp.disable === 'function') {
      expressApp.disable('x-powered-by');
    }

    app.setGlobalPrefix('api/v1', {
      exclude: ['/'],
    });

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

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / (Root Service Descriptor) — verifies success envelope and trace header', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.headers).toHaveProperty('x-trace-id');
        expect(res.headers['x-trace-id']).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(res.headers['x-powered-by']).toBeUndefined();
        expect(res.body).toEqual({
          success: true,
          data: {
            name: 'Naba Academy API',
            version: 'v1',
          },
        });
      });
  });

  it('GET /api/v1/health (Health Check Endpoint) — verifies canonical ApiSuccess envelope', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.headers).toHaveProperty('x-trace-id');
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('status', 'ok');
        expect(res.body.data).toHaveProperty('service', 'naba-api');
        expect(res.body.data).toHaveProperty('timestamp');
        expect(new Date(res.body.data.timestamp).getTime()).not.toBeNaN();
        expect(res.body.data).toHaveProperty('dependencies');
        expect(res.body.data.dependencies).toEqual({
          database: 'up',
          redis: 'up',
          storage: 'unconfigured',
        });

        // Strict negative assertions: zero credential or network topology exposure
        const serialized = JSON.stringify(res.body);
        expect(serialized).not.toMatch(/redis:\/\//i);
        expect(serialized).not.toMatch(/postgres:\/\//i);
        expect(serialized).not.toMatch(/password/i);
        expect(serialized).not.toMatch(/secret/i);
      });
  });

  it('GET /api/v1/non-existent-route (Standardized 404 Error Format) — verifies error envelope and matching trace_id', () => {
    return request(app.getHttpServer())
      .get('/api/v1/non-existent-route')
      .expect(404)
      .expect((res) => {
        const traceHeader = res.headers['x-trace-id'];
        expect(traceHeader).toBeDefined();
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
        expect(res.body.error).toHaveProperty('message');
        expect(res.body.error).toHaveProperty('trace_id', traceHeader);
        expect(res.body.error.trace_id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
      });
  });

  it('Verifies security headers (X-Powered-By removed, X-Content-Type-Options nosniff)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect((res) => {
        expect(res.headers['x-powered-by']).toBeUndefined();
        expect(res.headers['x-content-type-options']).toBe('nosniff');
      });
  });
});
