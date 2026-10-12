import { Injectable, Logger, Optional } from '@nestjs/common';
import { DataSource } from 'typeorm';

export type DatabaseHealthStatus = 'up' | 'down';

/**
 * DatabaseHealthService performs live, non-invasive health probes against PostgreSQL.
 *
 * It guarantees:
 * - Real verification via SELECT 1
 * - Zero leakage of credentials, passwords, or connection strings in logs and responses
 * - Accurate reporting of degraded dependency state
 */
@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(@Optional() private readonly dataSource?: DataSource) {}

  /**
   * Executes a lightweight 'SELECT 1' probe on the PostgreSQL connection.
   *
   * @returns 'up' when the connection is live and queryable, otherwise 'down'.
   */
  async check(): Promise<DatabaseHealthStatus> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      return 'down';
    }

    try {
      await this.dataSource.query('SELECT 1');
      return 'up';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      this.logger.warn(`PostgreSQL health probe failed: ${message}`);
      return 'down';
    }
  }
}
