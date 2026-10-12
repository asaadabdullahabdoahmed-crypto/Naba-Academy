import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { StorageConfig } from '../../config/configuration';
import {
  ObjectMetadata,
  ObjectStorage,
  ObjectStreamResult,
} from './storage.interface';
import { sanitizeStorageKey } from './storage-key.util';

const DEFAULT_EXPIRY_SECONDS = 900; // 15 minutes
const MAX_EXPIRY_SECONDS = 3600;    // 1 hour cap

@Injectable()
export class S3StorageService implements ObjectStorage {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly client: S3Client | null = null;
  private readonly bucket: string | null = null;
  private readonly isConfigured: boolean = false;

  constructor(private readonly configService: ConfigService) {
    const storageConfig = this.configService.get<StorageConfig>('storage');
    const endpoint = storageConfig?.endpoint;
    const region = storageConfig?.region || 'us-east-1';
    const bucket = storageConfig?.bucket;
    const accessKey = storageConfig?.accessKey;
    const secretKey = storageConfig?.secretKey;
    const forcePathStyle = storageConfig?.forcePathStyle ?? false;

    if (bucket && accessKey && secretKey) {
      this.bucket = bucket;
      this.isConfigured = true;
      this.client = new S3Client({
        region,
        endpoint: endpoint || undefined,
        forcePathStyle,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });
      this.logger.log(
        `Object Storage initialized (Region: ${region}, Bucket: ${bucket}, ForcePathStyle: ${forcePathStyle})`,
      );
    } else {
      this.logger.log('Object Storage credentials unconfigured for current environment.');
    }
  }

  private ensureConfigured(): { client: S3Client; bucket: string } {
    if (!this.isConfigured || !this.client || !this.bucket) {
      throw new Error(
        '[StorageConfigurationError] Object Storage is not configured in the current environment',
      );
    }
    return { client: this.client, bucket: this.bucket };
  }

  private clampExpiry(expiresInSeconds?: number): number {
    if (!expiresInSeconds || expiresInSeconds <= 0) {
      return DEFAULT_EXPIRY_SECONDS;
    }
    return Math.min(expiresInSeconds, MAX_EXPIRY_SECONDS);
  }

  async putObject(
    key: string,
    data: Buffer | Uint8Array | string,
    contentType?: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    const { client, bucket } = this.ensureConfigured();
    const safeKey = sanitizeStorageKey(key);

    const body = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: safeKey,
      Body: body,
      ContentType: contentType || 'application/octet-stream',
      Metadata: metadata,
    });

    await client.send(command);
  }

  async getObjectStream(key: string): Promise<ObjectStreamResult> {
    const { client, bucket } = this.ensureConfigured();
    const safeKey = sanitizeStorageKey(key);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: safeKey,
    });

    const response = await client.send(command);

    if (!response.Body) {
      throw new Error(`[StorageReadError] Empty response body for key: ${safeKey}`);
    }

    return {
      stream: response.Body as Readable,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  }

  async deleteObject(key: string): Promise<void> {
    const { client, bucket } = this.ensureConfigured();
    const safeKey = sanitizeStorageKey(key);

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: safeKey,
    });

    await client.send(command);
  }

  async headObject(key: string): Promise<{ exists: boolean; metadata?: ObjectMetadata }> {
    const { client, bucket } = this.ensureConfigured();
    const safeKey = sanitizeStorageKey(key);

    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: safeKey,
      });

      const response = await client.send(command);
      return {
        exists: true,
        metadata: {
          size: response.ContentLength,
          contentType: response.ContentType,
          lastModified: response.LastModified,
          customMetadata: response.Metadata,
        },
      };
    } catch (err: unknown) {
      const errorName = (err as { name?: string })?.name;
      if (errorName === 'NotFound' || errorName === 'NoSuchKey') {
        return { exists: false };
      }
      throw err;
    }
  }

  async createSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string> {
    const { client, bucket } = this.ensureConfigured();
    const safeKey = sanitizeStorageKey(key);
    const duration = this.clampExpiry(expiresInSeconds);

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: safeKey,
    });

    return await getSignedUrl(client, command, { expiresIn: duration });
  }

  async createSignedUploadUrl(
    key: string,
    contentType?: string,
    expiresInSeconds?: number,
  ): Promise<string> {
    const { client, bucket } = this.ensureConfigured();
    const safeKey = sanitizeStorageKey(key);
    const duration = this.clampExpiry(expiresInSeconds);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: safeKey,
      ContentType: contentType || 'application/octet-stream',
    });

    return await getSignedUrl(client, command, { expiresIn: duration });
  }

  async checkHealth(): Promise<'up' | 'down' | 'unconfigured'> {
    if (!this.isConfigured || !this.client || !this.bucket) {
      return 'unconfigured';
    }

    try {
      // Non-destructive probe checking bucket accessibility
      const command = new HeadBucketCommand({ Bucket: this.bucket });
      await this.client.send(command);
      return 'up';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown storage probe error';
      this.logger.warn(`Storage health probe failed: ${message}`);
      return 'down';
    }
  }
}
