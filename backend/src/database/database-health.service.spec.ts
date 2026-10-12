import { DataSource } from 'typeorm';
import { DatabaseHealthService } from './database-health.service';

describe('DatabaseHealthService', () => {
  it('should return down if dataSource is undefined', async () => {
    const service = new DatabaseHealthService(undefined);
    const status = await service.check();
    expect(status).toBe('down');
  });

  it('should return down if dataSource is not initialized', async () => {
    const mockDataSource = {
      isInitialized: false,
      query: jest.fn(),
    } as unknown as DataSource;

    const service = new DatabaseHealthService(mockDataSource);
    const status = await service.check();
    expect(status).toBe('down');
    expect(mockDataSource.query).not.toHaveBeenCalled();
  });

  it('should return up when SELECT 1 probe succeeds', async () => {
    const mockDataSource = {
      isInitialized: true,
      query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as DataSource;

    const service = new DatabaseHealthService(mockDataSource);
    const status = await service.check();

    expect(status).toBe('up');
    expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('should return down when query probe throws an error', async () => {
    const mockDataSource = {
      isInitialized: true,
      query: jest.fn().mockRejectedValue(new Error('Connection terminated unexpectedly')),
    } as unknown as DataSource;

    const service = new DatabaseHealthService(mockDataSource);
    const status = await service.check();

    expect(status).toBe('down');
    expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
  });
});
