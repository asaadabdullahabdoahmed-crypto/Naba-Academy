export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

export interface ObjectMetadata {
  size?: number;
  contentType?: string;
  lastModified?: Date;
  customMetadata?: Record<string, string>;
}

export interface ObjectStreamResult {
  stream: NodeJS.ReadableStream;
  contentType?: string;
  contentLength?: number;
}

/**
 * Provider-agnostic Object Storage port.
 * Decouples domain and application layers from specific object storage vendors
 * (AWS S3, Cloudflare R2, MinIO, Backblaze B2, Render Object Storage).
 *
 * Invariant: Private-by-default architecture. All objects are private.
 * External access is granted exclusively through short-lived signed URLs.
 */
export interface ObjectStorage {
  /**
   * Uploads object content into storage.
   */
  putObject(
    key: string,
    data: Buffer | Uint8Array | string,
    contentType?: string,
    metadata?: Record<string, string>,
  ): Promise<void>;

  /**
   * Retrieves a readable stream for the specified object.
   */
  getObjectStream(key: string): Promise<ObjectStreamResult>;

  /**
   * Deletes an object by its canonical key.
   */
  deleteObject(key: string): Promise<void>;

  /**
   * Checks existence and metadata of an object without downloading its payload.
   */
  headObject(key: string): Promise<{ exists: boolean; metadata?: ObjectMetadata }>;

  /**
   * Generates a temporary, time-limited presigned URL for downloading a private object.
   * Default expiration: 15 minutes (900 seconds).
   */
  createSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Generates a temporary, time-limited presigned URL for uploading directly to private storage.
   * Default expiration: 15 minutes (900 seconds).
   */
  createSignedUploadUrl(
    key: string,
    contentType?: string,
    expiresInSeconds?: number,
  ): Promise<string>;

  /**
   * Performs a safe, non-destructive health/connectivity probe against the configured bucket.
   * Returns 'up' if bucket is accessible, 'down' if error, 'unconfigured' if credentials omitted.
   */
  checkHealth(): Promise<'up' | 'down' | 'unconfigured'>;
}
