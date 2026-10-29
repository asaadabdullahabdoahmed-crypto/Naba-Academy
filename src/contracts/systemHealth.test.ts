import assert from 'node:assert/strict';
import test from 'node:test';
import { parseSystemHealth } from './systemHealth';

const healthyResponse = {
  status: 'ok',
  service: 'naba-api',
  timestamp: '2026-10-29T17:00:00.000Z',
  dependencies: {
    database: 'up',
    redis: 'up',
    storage: 'unconfigured',
  },
};

test('accepts the documented health response without adding operational data', () => {
  assert.deepEqual(parseSystemHealth(healthyResponse), healthyResponse);
});

test('rejects unknown service and dependency status values', () => {
  assert.equal(parseSystemHealth({ ...healthyResponse, service: 'other-api' }), null);
  assert.equal(
    parseSystemHealth({
      ...healthyResponse,
      dependencies: { ...healthyResponse.dependencies, database: 'unknown' },
    }),
    null,
  );
});

test('requires degraded status when a core dependency is down', () => {
  const degradedResponse = {
    ...healthyResponse,
    status: 'degraded',
    dependencies: { ...healthyResponse.dependencies, redis: 'down' },
  };
  assert.deepEqual(parseSystemHealth(degradedResponse), degradedResponse);
  assert.equal(
    parseSystemHealth({
      ...healthyResponse,
      dependencies: { ...healthyResponse.dependencies, redis: 'down' },
    }),
    null,
  );
});

test('rejects malformed or incomplete health payloads', () => {
  assert.equal(parseSystemHealth(null), null);
  assert.equal(parseSystemHealth({ ...healthyResponse, timestamp: 'not-a-date' }), null);
  assert.equal(parseSystemHealth({ status: 'ok' }), null);
});
