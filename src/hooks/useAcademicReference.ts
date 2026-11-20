import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';

type ReferenceState<T> =
  | { status: 'disabled' | 'loading' | 'error' | 'forbidden' | 'unauthenticated' | 'missing'; data?: never }
  | { status: 'ready'; data: T };

/** Cancels stale reads, clears old records, and never converts API failures to empty results. */
export function useAcademicReference<T>(load: (signal: AbortSignal) => Promise<T>) {
  const { user, isLoading, refreshUser } = useAuth();
  const enabled = import.meta.env.VITE_ACADEMIC_CATALOG_READS_ENABLED === 'true';
  const [attempt, setAttempt] = useState(0);
  const [snapshot, setSnapshot] = useState<{
    load: typeof load; userId: string | undefined; attempt: number; state: ReferenceState<T>;
  } | null>(null);

  useEffect(() => {
    if (!enabled || isLoading || !user) { setSnapshot(null); return; }
    const setState = (state: ReferenceState<T>) => setSnapshot({ load, userId: user.id, attempt, state });
    const controller = new AbortController();
    setState({ status: 'loading' });
    load(controller.signal).then((data) => {
      if (!controller.signal.aborted) setState({ status: 'ready', data });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      if (error instanceof ApiError) {
        if (error.status === 401 || error.code === 'SESSION_REVOKED') {
          setState({ status: 'unauthenticated' });
          void refreshUser();
          return;
        }
        if (error.status === 403) { setState({ status: 'forbidden' }); return; }
        if (error.status === 503) { setState({ status: 'disabled' }); return; }
        if (error.status === 404) { setState({ status: 'missing' }); return; }
      }
      setState({ status: 'error' });
    });
    return () => controller.abort();
  }, [enabled, user?.id, isLoading, load, attempt, refreshUser]);

  // Do not render a prior identity, filter, page or course while the next effect starts.
  const state: ReferenceState<T> = !enabled ? { status: 'disabled' } : isLoading ? { status: 'loading' }
    : !user ? { status: 'unauthenticated' }
      : snapshot?.load === load && snapshot.userId === user.id && snapshot.attempt === attempt
        ? snapshot.state : { status: 'loading' };
  return {
    state,
    retry: () => setAttempt((value) => value + 1),
  };
}
