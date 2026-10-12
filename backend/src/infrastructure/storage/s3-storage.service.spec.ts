import { ConfigService } from '@nestjs/config';
import { S3StorageService } from './s3-storage.service';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://storage.naba.edu.sa/signed-url?token=xyz'),
}));

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockImplementation((command: { constructor: { name: string } }) => {
        if (command.constructor.name === 'HeadBucketCommand') {
          return Promise.resolve({});
        }
        if (command.constructor.name === 'HeadObjectCommand') {
          return Promise.resolve({
            ContentLength: 1024,
            ContentType: 'application/pdf',
            LastModified: new Date('2026-09-21'),
            Metadata: { uploadedBy: 'admin' },
          });
        }
        if (command.constructor.name === 'GetObjectCommand') {
          return Promise.resolve({
            Body: 'mock-stream',
            ContentType: 'application/pdf',
            ContentLength: 1024,
          });
        }
        return Promise.resolve({});
      }),
    })),
  };
});

describe('S3StorageService', () => {
  it('should report unconfigured health when credentials are missing', async () => {
    const unconfiguredConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;

    const service = new S3StorageService(unconfiguredConfigService);
    const health = await service.checkHealth();
    expect(health).toBe('unconfigured');

    await expect(service.putObject('test.txt', 'hello')).rejects.toThrow(
      /Object Storage is not configured/,
    );
  });

  it('should execute operations when properly configured', async () => {
    const configuredConfigService = {
      get: jest.fn().mockReturnValue({
        endpoint: 'http://localhost:9000',
        region: 'us-east-1',
        bucket: 'test-bucket',
        accessKey: 'test-key',
        secretKey: 'test-secret',
        forcePathStyle: true,
      }),
    } as unknown as ConfigService;

    const service = new S3StorageService(configuredConfigService);

    // Health probe
    const health = await service.checkHealth();
    expect(health).toBe('up');

    // Put Object
    await expect(service.putObject('docs/file.txt', 'content')).resolves.toBeUndefined();

    // Head Object
    const head = await service.headObject('docs/file.txt');
    expect(head.exists).toBe(true);
    expect(head.metadata?.size).toBe(1024);

    // Signed URLs
    const downloadUrl = await service.createSignedDownloadUrl('docs/file.txt', 300);
    expect(downloadUrl).toContain('signed-url?token=xyz');

    const uploadUrl = await service.createSignedUploadUrl('docs/upload.pdf', 'application/pdf', 600);
    expect(uploadUrl).toContain('signed-url?token=xyz');

    // Delete Object
    await expect(service.deleteObject('docs/file.txt')).resolves.toBeUndefined();
  });
});
