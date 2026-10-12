import React from 'react';
import { Settings, Shield, Bell, AlertCircle, Save } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AlumniSettingsPageProps {
  locale: Locale;
}

export const AlumniSettingsPage: React.FC<AlumniSettingsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  return (
    <PortalPage
      title={isAr ? 'إعدادات حساب الخريج' : 'Alumni Account Settings'}
      subtitle={
        isAr
          ? 'تفضيلات الحساب، إعدادات الخصوصية، وقنوات التواصل المعتمدة'
          : 'Account preferences, privacy configurations, and communication settings'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: isAr ? 'الإعدادات' : 'Settings' },
      ]}
      locale={locale}
      actions={
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
          <AlertCircle size={14} className="text-[#607086]" />
          <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="text-[#082B50] shrink-0" />
          <span>
            {isAr
              ? 'نموذج الإعدادات مهيأ للعرض. حفظ التغييرات وتطبيقها سيتفعل فور اكتمال الربط مع الواجهة الخلفية.'
              : 'Settings form prepared. Persisting preferences will activate once connected to the backend.'}
          </span>
        </div>

        {/* Settings Form Container */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EB]">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? 'تفضيلات الخصوصية وظهور الملف' : 'Privacy & Directory Visibility'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr ? 'التحكم في ظهور بيانات الملف في دليل الخريجين' : 'Manage your profile visibility in the institutional directory'}
              </p>
            </div>
            <Shield size={20} className="text-[#082B50]" />
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
              <div>
                <span className="font-bold text-[#102033] block">
                  {isAr ? 'إتاحة الملف المهني في دليل الخريجين' : 'Show Profile in Alumni Directory'}
                </span>
                <span className="text-[#607086] text-[11px]">
                  {isAr ? 'السماح للزملاء الخريجين بالاطلاع على المسمى والجهة' : 'Allow alumni peers to view professional title and employer'}
                </span>
              </div>
              <input type="checkbox" defaultChecked disabled className="rounded text-[#082B50] w-4 h-4 cursor-not-allowed" />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
              <div>
                <span className="font-bold text-[#102033] block">
                  {isAr ? 'استقبال إشعارات الفرص الوظيفية' : 'Receive Career & Job Alerts'}
                </span>
                <span className="text-[#607086] text-[11px]">
                  {isAr ? 'إرسال تنبيهات عند نشر شواغر تطابق التخصص' : 'Receive notifications when matching job postings are published'}
                </span>
              </div>
              <input type="checkbox" defaultChecked disabled className="rounded text-[#082B50] w-4 h-4 cursor-not-allowed" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-bold text-[#102033] block">
                  {isAr ? 'استقبال دعوات ملتقيات الخريجين' : 'Receive Event & Reunion Invitations'}
                </span>
                <span className="text-[#607086] text-[11px]">
                  {isAr ? 'تلقي دعوات حضور المؤتمرات والفعاليات السنوية' : 'Get notified of annual summits and webinars'}
                </span>
              </div>
              <input type="checkbox" defaultChecked disabled className="rounded text-[#082B50] w-4 h-4 cursor-not-allowed" />
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE3EB] flex justify-end">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
              title={isAr ? 'يتطلب ربط الواجهة الخلفية لحفظ الإعدادات' : 'Requires backend connection to save preferences'}
            >
              <Save size={14} />
              <span>{isAr ? 'حفظ التفضيلات' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
