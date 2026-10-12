import React, { useState } from 'react';
import { Lock, Video } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorSettingsPageProps {
  locale: Locale;
}

export const InstructorSettingsPage: React.FC<InstructorSettingsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [autoRecord, setAutoRecord] = useState(true);
  const [muteOnEntry, setMuteOnEntry] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <PortalPage
      title={isAr ? 'إعدادات الحساب وتفضيلات التدريس' : 'Faculty Preferences & Settings'}
      subtitle={
        isAr
          ? 'تخصيص بيئة البث المباشر، تنبيهات التسليمات، وإعدادات الأمان الأكاديمي'
          : 'Configure live studio defaults, notification thresholds, and security preferences'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'الإعدادات' : 'Settings' },
      ]}
      locale={locale}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Live Broadcast Defaults */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#DCE3EB]">
            <Video size={18} className="text-[#082B50]" />
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'تفضيلات قاعة البث المباشر (Live Studio)' : 'Live Studio Preferences'}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
              <div>
                <span className="font-semibold text-[#102033] block">
                  {isAr ? 'بدء التسجيل السحابي تلقائياً عند انطلاق المحاضرة' : 'Auto-record live streams to cloud'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'أرشفة الجلسة وإتاحتها تلقائياً للطلاب بعد انتهاء البث' : 'Archive session automatically after lecture concludes'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoRecord}
                onChange={(e) => setAutoRecord(e.target.checked)}
                className="rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
              <div>
                <span className="font-semibold text-[#102033] block">
                  {isAr ? 'كتم ميكروفونات الطلاب تلقائياً عند الدخول' : 'Mute student microphones on entry'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'الحفاظ على هدوء القاعة ومنع التشويش أثناء الشرح' : 'Keep room quiet and manage lecture flow'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={muteOnEntry}
                onChange={(e) => setMuteOnEntry(e.target.checked)}
                className="rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-semibold text-[#102033] block">
                  {isAr ? 'استقبال إشعارات البريد للتسليمات الجديدة' : 'Email notifications for coursework submissions'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'إرسال ملخص يومي بالتكليفات المكتملة' : 'Receive daily digests of completed student submissions'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-[#DCE3EB] text-[#082B50] focus:ring-[#082B50] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
            title={isAr ? 'حفظ الإعدادات متاح عند اتصال خادم التفضيلات' : 'Preferences persist when settings service connects'}
          >
            <Lock size={14} className="text-[#D6A53A]/60" />
            <span>{isAr ? 'حفظ التفضيلات' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </PortalPage>
  );
};
