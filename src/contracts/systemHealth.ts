export type DependencyStatus = 'up' | 'down' | 'unconfigured';

export interface SystemHealth {
  status: 'ok' | 'degraded';
  service: 'naba-api';
  timestamp: string;
  dependencies: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    storage: DependencyStatus;
  };
}

export function parseSystemHealth(value: unknown): SystemHealth | null {
  if (!value || typeof value !== 'object') return null;

  const response = value as Record<string, unknown>;
  const dependencies = response.dependencies;
  if (!dependencies || typeof dependencies !== 'object') return null;

  const statuses = dependencies as Record<string, unknown>;
  if (
    (response.status !== 'ok' && response.status !== 'degraded') ||
    response.service !== 'naba-api' ||
    typeof response.timestamp !== 'string' ||
    Number.isNaN(Date.parse(response.timestamp)) ||
    (statuses.database !== 'up' && statuses.database !== 'down') ||
    (statuses.redis !== 'up' && statuses.redis !== 'down') ||
    (statuses.storage !== 'up' &&
      statuses.storage !== 'down' &&
      statuses.storage !== 'unconfigured')
  ) {
    return null;
  }

  const expectedStatus =
    statuses.database === 'up' && statuses.redis === 'up' ? 'ok' : 'degraded';
  if (response.status !== expectedStatus) return null;

  return {
    status: response.status,
    service: 'naba-api',
    timestamp: response.timestamp,
    dependencies: {
      database: statuses.database,
      redis: statuses.redis,
      storage: statuses.storage,
    },
  };
}
