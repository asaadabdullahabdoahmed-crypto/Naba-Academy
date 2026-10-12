import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmOptions } from './database.config';
import { TransactionService } from './transaction.service';
import { DatabaseHealthService } from './database-health.service';

/**
 * Global DatabaseModule providing TypeORM persistence and transaction management.
 *
 * Invariants:
 * - Pure Data Mapper architecture (Repository, EntityManager, DataSource)
 * - Zero Active Record / BaseEntity usage
 * - Strict migration-only schema evolution (synchronize: false, dropSchema: false)
 * - Encapsulated transaction boundary via TransactionService
 * - Live non-destructive database health checks via DatabaseHealthService
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getTypeOrmOptions(configService),
    }),
  ],
  providers: [TransactionService, DatabaseHealthService],
  exports: [TypeOrmModule, TransactionService, DatabaseHealthService],
})
export class DatabaseModule {}
