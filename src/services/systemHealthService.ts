import { ApiError, API_BASE_URL, apiRequest } from './apiClient';
import { parseSystemHealth } from '../contracts/systemHealth';

function getHealthEndpoint(): string {
  if (API_BASE_URL.startsWith('/')) {
    if (typeof window === 'undefined') {
      throw new Error('The system health endpoint requires a browser origin.');
    }
    return new URL('/health', window.location.origin).toString();
  }

  return new URL('/health', API_BASE_URL).toString();
}

export async function getSystemHealth(signal?: AbortSignal) {
  const response = await apiRequest<unknown>(getHealthEndpoint(), {
    cache: 'no-store',
    signal,
  });
  const health = parseSystemHealth(response);

  if (!health) {
    throw new ApiError(
      'The API returned an invalid health response.',
      'INVALID_HEALTH_RESPONSE',
      502,
    );
  }

  return health;
}
