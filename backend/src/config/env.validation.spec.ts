import 'reflect-metadata';
import {
  Environment,
  EnvironmentVariables,
  parseCorsOrigins,
  validateEnvironment,
} from './env.validation';
import { createCorsOriginValidator } from './cors.config';

describe('Configuration & Environment Validation', () => {
  describe('validateEnvironment', () => {
    it('should validate and pass a valid development configuration', () => {
      const config = {
        NODE_ENV: 'development',
        PORT: '4000',
        API_PREFIX: 'api/v1',
        CORS_ORIGINS: 'http://localhost:3000,http://localhost:5173',
      };

      const result = validateEnvironment(config);
      expect(result).toBeInstanceOf(EnvironmentVariables);
      expect(result.NODE_ENV).toBe(Environment.Development);
      expect(result.PORT).toBe(4000);
      expect(result.API_PREFIX).toBe('api/v1');
    });

    it('should validate and pass a valid production configuration', () => {
      const config = {
        NODE_ENV: 'production',
        PORT: 8080,
        API_PREFIX: 'api/v1',
        CORS_ORIGINS: 'https://naba.edu.sa',
        DATABASE_URL: 'postgresql://prod_user:secret@db.naba.internal:5432/naba_prod',
      };

      const result = validateEnvironment(config);
      expect(result.NODE_ENV).toBe(Environment.Production);
      expect(result.PORT).toBe(8080);
      expect(result.DATABASE_URL).toBe('postgresql://prod_user:secret@db.naba.internal:5432/naba_prod');
    });

    it('should validate Redis and Object Storage environment variables', () => {
      const config = {
        NODE_ENV: 'development',
        PORT: 4000,
        REDIS_URL: 'redis://:mypassword@localhost:6379/0',
        REDIS_CONNECT_TIMEOUT_MS: 5000,
        REDIS_MAX_RETRIES_PER_REQUEST: 5,
        OBJECT_STORAGE_ENDPOINT: 'http://localhost:9000',
        OBJECT_STORAGE_REGION: 'us-east-1',
        OBJECT_STORAGE_BUCKET: 'naba-bucket',
        OBJECT_STORAGE_ACCESS_KEY: 'minioadmin',
        OBJECT_STORAGE_SECRET_KEY: 'minioadmin',
        OBJECT_STORAGE_FORCE_PATH_STYLE: 'true',
      };

      const result = validateEnvironment(config);
      expect(result.REDIS_URL).toBe('redis://:mypassword@localhost:6379/0');
      expect(result.REDIS_CONNECT_TIMEOUT_MS).toBe(5000);
      expect(result.REDIS_MAX_RETRIES_PER_REQUEST).toBe(5);
      expect(result.OBJECT_STORAGE_BUCKET).toBe('naba-bucket');
      expect(result.OBJECT_STORAGE_FORCE_PATH_STYLE).toBe(true);
    });

    it('should fail validation when REDIS_URL has invalid protocol', () => {
      const config = {
        NODE_ENV: 'development',
        PORT: 4000,
        REDIS_URL: 'http://localhost:6379',
      };

      expect(() => validateEnvironment(config)).toThrow(
        /REDIS_URL must be a valid Redis connection URL/,
      );
    });

    it('should fail startup when DATABASE_URL is missing in production', () => {
      const config = {
        NODE_ENV: 'production',
        PORT: 8080,
        API_PREFIX: 'api/v1',
        CORS_ORIGINS: 'https://naba.edu.sa',
      };

      expect(() => validateEnvironment(config)).toThrow(
        /DATABASE_URL is required in production environment/,
      );
    });

    it('should fail startup when NODE_ENV is invalid', () => {
      const config = {
        NODE_ENV: 'invalid_environment',
        PORT: 4000,
      };

      expect(() => validateEnvironment(config)).toThrow(
        /ConfigValidationError[\s\S]*NODE_ENV must be one of/,
      );
    });

    it('should fail startup when PORT is out of range (< 1)', () => {
      const config = {
        NODE_ENV: 'development',
        PORT: 0,
      };

      expect(() => validateEnvironment(config)).toThrow(
        /ConfigValidationError[\s\S]*PORT must be at least 1/,
      );
    });

    it('should fail startup when PORT is out of range (> 65535)', () => {
      const config = {
        NODE_ENV: 'development',
        PORT: 70000,
      };

      expect(() => validateEnvironment(config)).toThrow(
        /ConfigValidationError[\s\S]*PORT cannot exceed 65535/,
      );
    });

    it('should fail startup when PORT is non-numeric', () => {
      const config = {
        NODE_ENV: 'development',
        PORT: 'not-a-number',
      };

      expect(() => validateEnvironment(config)).toThrow(
        /ConfigValidationError[\s\S]*PORT must be an integer/,
      );
    });
  });

  describe('parseCorsOrigins', () => {
    it('should parse comma-separated origins, trimming whitespace and filtering empty items', () => {
      const raw = '  http://localhost:3000, , https://staging.naba.edu.sa  , ';
      const parsed = parseCorsOrigins(raw, Environment.Development);
      expect(parsed).toEqual(['http://localhost:3000', 'https://staging.naba.edu.sa']);
    });

    it('should fallback to default localhost:3000 if undefined or empty', () => {
      expect(parseCorsOrigins(undefined)).toEqual(['http://localhost:3000']);
      expect(parseCorsOrigins('')).toEqual(['http://localhost:3000']);
    });

    it('should throw security violation when wildcard (*) is specified in production', () => {
      expect(() => parseCorsOrigins('*', Environment.Production)).toThrow(
        /SecurityViolation.*Wildcard CORS origin \(\*\) is forbidden in production/,
      );
    });

    it('should permit wildcard in development if explicitly passed', () => {
      const parsed = parseCorsOrigins('*', Environment.Development);
      expect(parsed).toEqual(['*']);
    });
  });

  describe('createCorsOriginValidator', () => {
    const allowed = ['http://localhost:3000', 'https://naba.edu.sa'];
    const validator = createCorsOriginValidator(allowed);

    it('should allow requests without origin header (server-to-server, curl)', (done) => {
      validator(undefined, (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    it('should allow requests from approved origins', (done) => {
      validator('https://naba.edu.sa', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    it('should deny requests from unapproved origins', (done) => {
      validator('https://malicious-site.com', (err, allow) => {
        expect(err).toBeInstanceOf(Error);
        expect(allow).toBe(false);
        done();
      });
    });
  });
});
