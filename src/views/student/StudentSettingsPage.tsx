import React, { useState } from 'react';
import { Lock, Bell, Globe, Shield, CheckCircle2, ShieldCheck, Key, Save } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentSettingsPageProps {
  locale: Locale;
}

export const StudentSettingsPage: React.FC<StudentSettingsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();

  const [emailNotif, setEmailNotif] = useState<boolean>(true);
  const [smsNotif, setSmsNotif] = useState<boolean>(true);
  const [examReminders, setExamReminders] = useState<boolean>(true);
  const [twoFactor, setTwoFactor] = useState<boolean>(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
