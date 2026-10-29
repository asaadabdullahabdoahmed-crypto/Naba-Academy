import { useCallback, useEffect, useState } from 'react';
import { getSystemHealth } from '../services/systemHealthService';
import type { SystemHealth } from '../contracts/systemHealth';

type SystemHealthState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; health: SystemHealth };

export function useSystemHealth() {
  const [state, setState] = useState<SystemHealthState>({ status: 'loading' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    getSystemHealth(controller.signal)
      .then((health) => setState({ status: 'loaded', health }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to load system health.',
        });
      });

    return () => controller.abort();
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return { ...state, refresh };
}
