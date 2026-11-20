import { describe, expect, it } from 'vitest';
import { parseSystemHealth } from './systemHealth';

const healthyResponse = {
  status: 'ok',
  service: 'naba-api',
  timestamp: '2026-10-29T17:00:00.000Z',
  dependencies: {
    database: 'up',
    redis: 'unconfigured',
    storage: 'unconfigured',
  },
};

describe('parseSystemHealth', () => {
  it('accepts the documented response with optional services unconfigured', () => {
    expect(parseSystemHealth(healthyResponse)).toEqual(healthyResponse);
  });

  it('rejects unknown service and dependency status values', () => {
    expect(parseSystemHealth({ ...healthyResponse, service: 'other-api' })).toBeNull();
    expect(parseSystemHealth({
      ...healthyResponse,
      dependencies: { ...healthyResponse.dependencies, database: 'unknown' },
    })).toBeNull();
  });

  it('requires degraded status when a configured dependency is down', () => {
    const degradedResponse = {
      ...healthyResponse,
      status: 'degraded',
      dependencies: { ...healthyResponse.dependencies, redis: 'down' },
    };
    expect(parseSystemHealth(degradedResponse)).toEqual(degradedResponse);
    expect(parseSystemHealth({
      ...healthyResponse,
      dependencies: { ...healthyResponse.dependencies, redis: 'down' },
    })).toBeNull();
  });

  it('requires degraded status when configured storage is down', () => {
    const degradedResponse = {
      ...healthyResponse,
      status: 'degraded',
      dependencies: { ...healthyResponse.dependencies, storage: 'down' },
    };
    expect(parseSystemHealth(degradedResponse)).toEqual(degradedResponse);
    expect(parseSystemHealth({
      ...healthyResponse,
      dependencies: { ...healthyResponse.dependencies, storage: 'down' },
    })).toBeNull();
  });

  it('rejects malformed or incomplete health payloads', () => {
    expect(parseSystemHealth(null)).toBeNull();
    expect(parseSystemHealth({ ...healthyResponse, timestamp: 'not-a-date' })).toBeNull();
    expect(parseSystemHealth({ status: 'ok' })).toBeNull();
  });
});
