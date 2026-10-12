import { ConfigService } from '@nestjs/config';
import { getTypeOrmOptions } from './database.config';
import { Environment } from '../config/env.validation';

describe('DatabaseConfig (getTypeOrmOptions)', () => {
  function createMockConfigService(values: Record<string, any>): ConfigService {
    return {
      get: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;
  }

  it('should enforce critical safety invariants (synchronize: false, dropSchema: false)', () => {
    const configService = createMockConfigService({
      'app.nodeEnv': Environment.Development,
      'database.url': 'postgresql://localhost:5432/naba_dev',
    });

    const options = getTypeOrmOptions(configService) as any;

    expect(options.synchronize).toBe(false);
    expect(options.dropSchema).toBe(false);
    expect(options.autoLoadEntities).toBe(true);
    expect(options.type).toBe('postgres');
  });

  it('should require DATABASE_URL in production environment', () => {
    const configService = createMockConfigService({
      'app.nodeEnv': Environment.Production,
      'database.url': undefined,
    });

    expect(() => getTypeOrmOptions(configService)).toThrow(
      /\[DatabaseConfigError\] DATABASE_URL is required in production environment/,
    );
  });

  it('should require DATABASE_URL in staging environment', () => {
    const configService = createMockConfigService({
      'app.nodeEnv': Environment.Staging,
      'database.url': undefined,
    });

    expect(() => getTypeOrmOptions(configService)).toThrow(
      /\[DatabaseConfigError\] DATABASE_URL is required in staging environment/,
    );
  });

  it('should configure connection pool and SSL settings correctly', () => {
    const configService = createMockConfigService({
      'app.nodeEnv': Environment.Production,
      'database.url': 'postgresql://user:pass@remote:5432/naba_prod',
      'database.ssl': true,
      'database.sslRejectUnauthorized': true,
      'database.poolMax': 25,
      'database.connectTimeoutMs': 15000,
    });

    const options = getTypeOrmOptions(configService) as any;

    expect(options.url).toBe('postgresql://user:pass@remote:5432/naba_prod');
    expect(options.ssl).toEqual({ rejectUnauthorized: true });
    expect(options.extra.max).toBe(25);
    expect(options.extra.connectionTimeoutMillis).toBe(15000);
    expect(options.synchronize).toBe(false);
    expect(options.dropSchema).toBe(false);
  });
});
