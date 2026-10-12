import { Global, Module } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';
import { OBJECT_STORAGE } from './storage.interface';

@Global()
@Module({
  providers: [
    S3StorageService,
    {
      provide: OBJECT_STORAGE,
      useExisting: S3StorageService,
    },
  ],
  exports: [S3StorageService, OBJECT_STORAGE],
})
export class StorageModule {}
