import { DataSource, EntityManager } from 'typeorm';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  it('should throw error when dataSource is undefined', async () => {
    const service = new TransactionService(undefined);

    await expect(service.run(async () => 'test')).rejects.toThrow(
      /\[TransactionServiceError\] Cannot execute transaction: database DataSource is not initialized/,
    );
  });

  it('should throw error when dataSource is not initialized', async () => {
    const mockDataSource = {
      isInitialized: false,
    } as DataSource;

    const service = new TransactionService(mockDataSource);

    await expect(service.run(async () => 'test')).rejects.toThrow(
      /\[TransactionServiceError\] Cannot execute transaction: database DataSource is not initialized/,
    );
  });

  it('should execute operation inside dataSource transaction and return result', async () => {
    const mockManager = {
      save: jest.fn(),
    } as unknown as EntityManager;

    const mockDataSource = {
      isInitialized: true,
      transaction: jest.fn(async (callback: (em: EntityManager) => Promise<any>) => {
        return callback(mockManager);
      }),
    } as unknown as DataSource;

    const service = new TransactionService(mockDataSource);

    const result = await service.run(async (em) => {
      expect(em).toBe(mockManager);
      return { success: true, count: 42 };
    });

    expect(result).toEqual({ success: true, count: 42 });
    expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from transactional operation', async () => {
    const mockManager = {} as EntityManager;

    const mockDataSource = {
      isInitialized: true,
      transaction: jest.fn(async (callback: (em: EntityManager) => Promise<any>) => {
        return callback(mockManager);
      }),
    } as unknown as DataSource;

    const service = new TransactionService(mockDataSource);

    await expect(
      service.run(async () => {
        throw new Error('Transaction rolled back: duplicate student national ID');
      }),
    ).rejects.toThrow('Transaction rolled back: duplicate student national ID');
  });
});
