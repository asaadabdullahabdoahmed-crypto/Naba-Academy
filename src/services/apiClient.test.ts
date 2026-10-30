import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './apiClient';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('preserves pagination metadata when unwrapping the standard response envelope', async () => {
    const data = [{ id: 'university-a', nameEn: 'University A' }];
    const meta = {
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, data, meta }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );

    await expect(apiRequest('/academic/universities')).resolves.toEqual({ data, meta });
  });
});
