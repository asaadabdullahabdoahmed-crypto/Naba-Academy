import { Injectable, Optional } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

/**
 * TransactionService encapsulates atomic PostgreSQL transactions using TypeORM's Data Mapper.
 *
 * It provides a clean, strongly-typed boundary for coordinating multiple consistency-related
 * operations (e.g. registration enrollment, financial ledger posting, grade approvals)
 * without leaking raw connection mechanics or adopting Active Record anti-patterns.
 */
@Injectable()
export class TransactionService {
  constructor(@Optional() private readonly dataSource?: DataSource) {}

  /**
   * Executes an operation within an isolated database transaction.
   * Automatically commits upon successful completion or rolls back if an exception occurs.
   *
   * @param operation A function that receives the transactional EntityManager
   * @returns The result of the transactional operation
   */
  async run<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error(
        '[TransactionServiceError] Cannot execute transaction: database DataSource is not initialized',
      );
    }

    return this.dataSource.transaction(async (manager: EntityManager) => {
      return operation(manager);
    });
  }
}
