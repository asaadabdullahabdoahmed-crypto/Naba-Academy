import { ConfigService } from '@nestjs/config';
import { buildBullMqConnection } from './job-queue.module';
import { DEFAULT_JOB_OPTIONS, QueueName } from './queue.constants';

describe('JobQueue Infrastructure', () => {
  it('should define foundational queue names and default job retry options', () => {
    expect(QueueName.NOTIFICATIONS).toBe('notifications');
    expect(QueueName.EMAILS).toBe('emails');
    expect(QueueName.MEDIA_PROCESSING).toBe('media-processing');
    expect(QueueName.DOCUMENT_GENERATION).toBe('document-generation');

    expect(DEFAULT_JOB_OPTIONS.attempts).toBe(3);
    expect(DEFAULT_JOB_OPTIONS.backoff).toEqual({
      type: 'exponential',
      delay: 1000,
    });
    expect(DEFAULT_JOB_OPTIONS.removeOnComplete).toBe(100);
    expect(DEFAULT_JOB_OPTIONS.removeOnFail).toBe(500);
  });

  it('should build fallback connection with maxRetriesPerRequest null when no Redis URL', () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue({ url: undefined }),
    } as unknown as ConfigService;

    const connection = buildBullMqConnection(mockConfigService);
    expect(connection.host).toBe('localhost');
    expect(connection.port).toBe(6379);
    expect(connection.maxRetriesPerRequest).toBeNull();
    expect(connection.lazyConnect).toBe(true);
  });

  it('should parse valid Redis URL into BullMQ connection parameters', () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue({
        url: 'redis://default:mypassword@cluster.redis.host:6380/2',
      }),
    } as unknown as ConfigService;

    const connection = buildBullMqConnection(mockConfigService);
    expect(connection.host).toBe('cluster.redis.host');
    expect(connection.port).toBe(6380);
    expect(connection.password).toBe('mypassword');
    expect(connection.db).toBe(2);
    expect(connection.maxRetriesPerRequest).toBeNull();
  });
});
