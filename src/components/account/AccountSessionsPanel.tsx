import React, { useCallback, useEffect, useState } from 'react';
import { Laptop, RefreshCw, Smartphone, X } from 'lucide-react';
import { useConfirm } from '../ui/dialog';
import { useToast } from '../ui/toast';
import { ActiveSessionItem, authService } from '../../services/authService';
import { useTranslation } from '../../i18n/dictionaries';

export const AccountSessionsPanel: React.FC = () => {
  const { isAr, t, formatDate } = useTranslation();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ActiveSessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.listSessions();
      setSessions(response.sessions);
      setCurrentSessionId(response.currentSessionId);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : (isAr ? 'تعذر تحميل الجلسات النشطة.' : 'Unable to load active sessions.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const revokeSession = async (session: ActiveSessionItem) => {
    if (session.isCurrent || session.id === currentSessionId) return;

    const confirmed = await confirm({
      title: t('accountSessions.revokeTitle'),
      description: t('accountSessions.revokeDescription'),
      confirmLabel: t('accountSessions.revoke'),
      cancelLabel: t('common.cancel'),
      variant: 'danger',
    });
    if (!confirmed) return;

    setBusySessionId(session.id);
    try {
      await authService.revokeSession(session.id);
      toast.success(t('accountSessions.revokeSuccess'));
      await loadSessions();
    } catch (requestError: unknown) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : t('accountSessions.revokeError'),
      );
    } finally {
      setBusySessionId(null);
    }
  };

  const revokeOtherSessions = async () => {
    const hasOtherSessions = sessions.some(
      (session) => !session.isCurrent && session.id !== currentSessionId,
    );
    if (!hasOtherSessions) {
      toast.info(t('accountSessions.noOtherSessions'));
      return;
    }

    const confirmed = await confirm({
      title: t('accountSessions.revokeOthersTitle'),
      description: t('accountSessions.revokeOthersDescription'),
      confirmLabel: t('accountSessions.revokeOthers'),
      cancelLabel: t('common.cancel'),
      variant: 'warning',
    });
    if (!confirmed) return;

    setIsRevokingOthers(true);
    try {
      const response = await authService.logoutOtherSessions();
      toast.success(t('accountSessions.revokeOthersSuccess', { count: response.revokedCount }));
      await loadSessions();
    } catch (requestError: unknown) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : t('accountSessions.revokeError'),
      );
    } finally {
      setIsRevokingOthers(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#DCE3EB] bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#DCE3EB] pb-4">
        <div>
          <h2 className="text-sm font-bold text-[#082B50]">{t('accountSessions.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-[#607086]">
            {t('accountSessions.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadSessions()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-semibold text-[#082B50] hover:bg-[#EFF3F8] disabled:cursor-wait disabled:opacity-50"
          >
            <RefreshCw size={14} />
            {t('accountSessions.refresh')}
          </button>
          <button
            type="button"
            onClick={() => void revokeOtherSessions()}
            disabled={isLoading || isRevokingOthers || busySessionId !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#082B50] px-3 py-2 text-xs font-semibold text-white hover:bg-[#061E38] disabled:cursor-wait disabled:opacity-50"
          >
            <X size={14} />
            {t('accountSessions.revokeOthers')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="py-6 text-center text-sm text-[#607086]">{t('accountSessions.loading')}</p>
      ) : error ? (
        <div className="py-5" role="alert">
          <p className="text-sm text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadSessions()}
            className="mt-3 text-xs font-bold text-[#082B50] underline underline-offset-4"
          >
            {t('accountSessions.retry')}
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#607086]">{t('accountSessions.empty')}</p>
      ) : (
        <ul className="divide-y divide-[#DCE3EB]">
          {sessions.map((session) => {
            const isCurrent = session.isCurrent || session.id === currentSessionId;
            const deviceDescription = session.device || session.browser
              || (isAr ? 'جهاز غير معروف' : 'Unknown device');
            const Icon = /mobile|phone|android|iphone/i.test(
              `${session.device || ''} ${session.browser || ''}`,
            ) ? Smartphone : Laptop;

            return (
              <li key={session.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF3F8] text-[#082B50]">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="break-all text-sm font-semibold text-[#102033]">{deviceDescription}</p>
                      {isCurrent && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {t('accountSessions.current')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#607086]">
                      {t('accountSessions.lastActive')}:{' '}
                      {formatDate(session.lastActiveAt || session.lastActivityAt || session.createdAt)}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => void revokeSession(session)}
                    disabled={isLoading || busySessionId === session.id || isRevokingOthers}
                    className="self-start rounded-lg border border-[#DCE3EB] px-3 py-2 text-xs font-semibold text-[#082B50] hover:bg-[#EFF3F8] disabled:cursor-wait disabled:opacity-50 sm:self-center"
                  >
                    {t('accountSessions.revoke')}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
