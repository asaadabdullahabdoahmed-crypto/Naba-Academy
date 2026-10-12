import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

/**
 * Dedicated entry point for Naba Academy Background Worker processes.
 * Runs in a standalone headless NestJS ApplicationContext without opening HTTP ports.
 */
export async function bootstrapWorker() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Starting Naba Academy Background Worker process...');

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'warn', 'error'],
  });

  app.enableShutdownHooks();

  const handleShutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Shutting down worker process cleanly...`);
    try {
      await app.close();
      logger.log('Worker process shut down successfully.');
      process.exit(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Error during worker shutdown: ${msg}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  logger.log('Naba Academy Background Worker process initialized.');
  return app;
}

// Only auto-execute if running directly as process entrypoint
if (require.main === module) {
  bootstrapWorker().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[WorkerBootstrapError] Fatal worker startup error: ${msg}`);
    process.exit(1);
  });
}
