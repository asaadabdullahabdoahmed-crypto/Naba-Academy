import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Bell,
  Globe,
  Shield,
  CheckCircle2,
  ShieldCheck,
  Key,
  Save,
  Laptop,
  Smartphone,
  Trash2,
  LogOut,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';
import { useConfirm } from '../../components/ui/dialog';
import { authService, ActiveSessionItem } from '../../services/authService';
import { ApiError } from '../../services/apiClient';

interface StudentSettingsPageProps {
  locale: Locale;
}

export const StudentSettingsPage: React.FC<StudentSettingsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [emailNotif, setEmailNotif] = useState<boolean>(true);
  const [smsNotif, setSmsNotif] = useState<boolean>(true);
  const [examReminders, setExamReminders] = useState<boolean>(true);
  const [twoFactor, setTwoFactor] = useState<boolean>(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Active Sessions state
  const [sessions, setSessions] = useState<ActiveSessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isLoggingOutOthers, setIsLoggingOutOthers] = useState<boolean>(false);

  const fetchSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setSessionsError(null);
    try {
      const data = await authService.listSessions();
      setSessions(data.sessions || []);
      setCurrentSessionId(data.currentSessionId || '');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setSessionsError(
        apiErr.message || (isAr ? 'فشل تحميل قائمة الجلسات النشطة' : 'Failed to load active sessions')
      );
    } finally {
      setIsLoadingSessions(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (session: ActiveSessionItem) => {
    if (session.isCurrent || session.id === currentSessionId) return;

    const deviceName = session.device || session.browser || (isAr ? 'هذا الجهاز' : 'this device');
    const confirmed = await confirm({
      title: isAr ? 'إنهاء الجلسة' : 'Revoke session',
      description: isAr
        ? `هل أنت متأكد من رغبتك في إنهاء هذه الجلسة (${deviceName})؟ سيتعين تسجيل الدخول مجدداً على ذلك الجهاز.`
        : `Are you sure you want to revoke this session (${deviceName})? That device will need to sign in again.`,
      confirmLabel: isAr ? 'إنهاء الجلسة' : 'Revoke session',
      cancelLabel: isAr ? 'إلغاء' : 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    setRevokingSessionId(session.id);
    try {
      await authService.revokeSession(session.id);
      toast.success(isAr ? 'تم إنهاء الجلسة بنجاح' : 'Session revoked successfully');
      await fetchSessions();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || (isAr ? 'فشل إنهاء الجلسة' : 'Failed to revoke session'));
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleLogoutOtherSessions = async () => {
    const hasOtherSessions = sessions.some((s) => !s.isCurrent && s.id !== currentSessionId);
    if (!hasOtherSessions) {
      toast.info(isAr ? 'لا توجد جلسات أخرى نشطة حالياً' : 'No other active sessions currently');
      return;
    }

    const confirmed = await confirm({
      title: isAr ? 'تسجيل الخروج من الأجهزة الأخرى' : 'Log out other sessions',
      description: isAr
        ? 'هل أنت متأكد من رغبتك في تسجيل الخروج من جميع الجلسات النشطة على الأجهزة الأخرى؟ ستبقى جلستك الحالية فقط.'
        : 'Are you sure you want to log out of all active sessions on other devices? Only your current session will remain active.',
      confirmLabel: isAr ? 'تسجيل الخروج من الأجهزة الأخرى' : 'Log out other sessions',
      cancelLabel: isAr ? 'إلغاء' : 'Cancel',
      variant: 'warning',
    });

    if (!confirmed) return;

    setIsLoggingOutOthers(true);
    try {
      const res = await authService.logoutOtherSessions();
      toast.success(
        isAr
          ? `تم إنهاء ${res.revokedCount} من الجلسات الأخرى بنجاح`
          : `Successfully logged out ${res.revokedCount} other session(s)`
      );
      await fetchSessions();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast.error(
        apiErr.message || (isAr ? 'فشل تسجيل الخروج من الأجهزة الأخرى' : 'Failed to log out other sessions')
      );
    } finally {
      setIsLoggingOutOthers(false);
    }
  };

  const formatDateTime = (isoDateString?: string) => {
    if (!isoDateString) return '—';
    try {
      const d = new Date(isoDateString);
      if (isNaN(d.getTime())) return isoDateString;
      return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoDateString;
    }
  };

  const getDeviceIcon = (deviceStr?: string, browserStr?: string) => {
    const text = `${deviceStr || ''} ${browserStr || ''}`.toLowerCase();
    if (text.includes('mobile') || text.includes('phone') || text.includes('android') || text.includes('iphone')) {
      return <Smartphone size={18} />;
    }
    return <Laptop size={18} />;
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(isAr ? 'كلمة المرور الجديدة غير متطابقة' : 'New passwords do not match');
      return;
    }
    toast.info(
      isAr
        ? 'تحديث كلمة المرور يتطلب ربط خادم المصادقة المركزي (NestJS Auth API)'
        : 'Password update requires connection to backend authentication service'
    );
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePreferences = () => {
    toast.info(
      isAr
        ? 'حفظ تفضيلات الحساب يتطلب ربط خادم تفضيلات المستخدم'
        : 'Saving preferences requires connection to user profile service'
    );
  };

  return (
    <PortalPage
      title={isAr ? 'إعدادات الحساب والأمان' : 'Account & Security Settings'}
      subtitle={
        isAr
          ? 'إدارة كلمة المرور، التحقق الثنائي، وتفضيلات الإشعارات والتنبيهات'
          : 'Password management, two-factor authentication, and notification preferences'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الإعدادات' : 'Settings' },
      ]}
      locale={locale}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Security & 2FA */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DCE3EB]">
            <ShieldCheck size={18} className="text-[#082B50]" />
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'الأمان والتحقق الثنائي (2FA)' : 'Security & Two-Factor Authentication'}
            </h3>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
            <div>
              <span className="text-xs font-bold text-[#102033] block">
                {isAr ? 'المصادقة الثنائية عند تسجيل الدخول' : 'Two-Factor Authentication'}
              </span>
              <span className="text-[11px] text-[#607086]">
                {isAr ? 'طلب رمز تحقق إضافي عبر رقم الهاتف المسجل عند كل عملية دخول' : 'Require one-time security OTP upon sign in'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={(e) => {
                setTwoFactor(e.target.checked);
                handleSavePreferences();
              }}
              className="w-4 h-4 rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50] cursor-pointer"
            />
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DCE3EB]">
            <Key size={18} className="text-[#082B50]" />
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
            </h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#102033] mb-1.5">
                {isAr ? 'كلمة المرور الحالية' : 'Current Password'}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                <Key size={14} className="text-[#D6A53A]" />
                <span>{isAr ? 'تحديث كلمة المرور' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security & Active Sessions Section */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#DCE3EB]">
            <div className="flex items-center gap-2">
              <Laptop size={18} className="text-[#082B50]" />
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? 'الأمان والجلسات النشطة' : 'Security & Active Sessions'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {sessions.some((s) => !s.isCurrent && s.id !== currentSessionId) && (
                <button
                  type="button"
                  onClick={handleLogoutOtherSessions}
                  disabled={isLoggingOutOthers || isLoadingSessions}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C23B3B] hover:text-white bg-[#FEE2E2]/60 hover:bg-[#C23B3B] border border-[#FECACA] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingOutOthers ? (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut size={13} />
                  )}
                  <span>{isAr ? 'تسجيل الخروج من الأجهزة الأخرى' : 'Log out other sessions'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={fetchSessions}
                disabled={isLoadingSessions}
                title={isAr ? 'تحديث الجلسات' : 'Refresh sessions'}
                className="p-1.5 rounded-lg border border-[#DCE3EB] text-[#607086] hover:text-[#082B50] hover:bg-[#F7F9FC] transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={14} className={isLoadingSessions ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <p className="text-xs text-[#607086] leading-relaxed">
            {isAr
              ? 'إدارة الجلسات والأجهزة المسجلة النشطة حالياً في حسابك. يمكنك إنهاء أي جلسة غير معروفة أو تسجيل الخروج من الأجهزة الأخرى.'
              : 'Manage active devices and sessions currently signed into your account. You can revoke any unrecognized session or log out other devices.'}
          </p>

          {/* Loading State */}
          {isLoadingSessions && (
            <div className="py-8 flex flex-col items-center justify-center gap-2.5 text-slate-500">
              <div className="w-6 h-6 border-2 border-[#082B50] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">
                {isAr ? 'جاري تحميل الجلسات النشطة...' : 'Loading active sessions...'}
              </span>
            </div>
          )}

          {/* Error State */}
          {!isLoadingSessions && sessionsError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span className="text-xs font-medium">{sessionsError}</span>
              </div>
              <button
                type="button"
                onClick={fetchSessions}
                className="px-3 py-1 text-xs font-bold bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-100 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              >
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingSessions && !sessionsError && sessions.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-500">
              {isAr ? 'لا توجد جلسات نشطة مسجلة' : 'No active sessions found'}
            </div>
          )}

          {/* Sessions List */}
          {!isLoadingSessions && !sessionsError && sessions.length > 0 && (
            <div className="space-y-3">
              {sessions.map((session) => {
                const isCurrent = session.isCurrent || session.id === currentSessionId;
                const isRevoking = revokingSessionId === session.id;

                return (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-[#F7F9FC] border-[#082B50]/30 shadow-xs'
                        : 'bg-white border-[#DCE3EB] hover:border-[#BCCAD8]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isCurrent
                              ? 'bg-[#082B50] text-white'
                              : 'bg-[#EFF3F8] text-[#082B50]'
                          }`}
                        >
                          {getDeviceIcon(session.device, session.browser)}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-xs font-bold text-[#102033]">
                              {session.device || (isAr ? 'جهاز مكتبي' : 'Desktop Device')}
                            </span>

                            {session.browser && (
                              <span className="text-[11px] font-medium text-[#607086] bg-slate-100 px-2 py-0.5 rounded-md">
                                {session.browser}
                              </span>
                            )}

                            {isCurrent && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                                <span>{isAr ? 'الجلسة الحالية' : 'Current session'}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#607086]">
                            {session.ipAddress && (
                              <span className="inline-flex items-center gap-1">
                                <Globe size={11} className="text-slate-400" />
                                <span>{session.ipAddress}</span>
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1">
                              <Clock size={11} className="text-slate-400" />
                              <span>
                                {isAr ? 'آخر نشاط:' : 'Last active:'}{' '}
                                {formatDateTime(session.lastActiveAt || session.lastActivityAt)}
                              </span>
                            </span>

                            <span className="text-slate-400">•</span>

                            <span>
                              {isAr ? 'تاريخ الدخول:' : 'Signed in:'}{' '}
                              {formatDateTime(session.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Revoke button for non-current sessions only */}
                      {!isCurrent && (
                        <div className="self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(session)}
                            disabled={isRevoking || isLoggingOutOthers}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#C23B3B] hover:text-white bg-[#FEE2E2]/40 hover:bg-[#C23B3B] border border-[#FECACA] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isRevoking ? (
                              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                            <span>{isAr ? 'إنهاء الجلسة' : 'Revoke session'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#DCE3EB]">
            <Bell size={18} className="text-[#082B50]" />
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'تفضيلات التنبيهات والإشعارات' : 'Notification Preferences'}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]/60">
              <div>
                <span className="text-xs font-bold text-[#102033] block">
                  {isAr ? 'إشعارات البريد الإلكتروني الأكاديمي' : 'Academic Email Notifications'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'استلام إعلانات المقررات والتكليفات الرسمية' : 'Receive course announcements and assignments'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailNotif}
                onChange={(e) => {
                  setEmailNotif(e.target.checked);
                  handleSavePreferences();
                }}
                className="w-4 h-4 rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]/60">
              <div>
                <span className="text-xs font-bold text-[#102033] block">
                  {isAr ? 'تنبيهات مواعيد الاختبارات' : 'Exam Schedule Reminders'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'تذكير بمواعيد جلسات الاختبارات الإلكترونية المراقبة' : 'Alerts prior to scheduled proctored exam sessions'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={examReminders}
                onChange={(e) => {
                  setExamReminders(e.target.checked);
                  handleSavePreferences();
                }}
                className="w-4 h-4 rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-xs font-bold text-[#102033] block">
                  {isAr ? 'رسائل التنبيه النصية (SMS)' : 'SMS Text Notifications'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'رسائل التنبيه العاجلة وتأكيدات التسجيل' : 'Critical security alerts and registration confirmations'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={smsNotif}
                onChange={(e) => {
                  setSmsNotif(e.target.checked);
                  handleSavePreferences();
                }}
                className="w-4 h-4 rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
