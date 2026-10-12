import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, Shield, Lock, Bell, AlertCircle, Save, BookOpen } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminSettingsPageProps {
  locale: Locale;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();

  const isRegistrationView = location.pathname.includes('/admin/registration');
  const isSecurityView = location.pathname.includes('/admin/security');

  let pageTitle = isAr ? 'إعدادات المنظومة العامة' : 'Platform Settings';
  let pageSubtitle = isAr
    ? 'المعايير المؤسسية، التقويم الأكاديمي، وسياسات التشغيل'
    : 'Institutional parameters, academic calendar, and operational policies';

  if (isRegistrationView) {
    pageTitle = isAr ? 'إعدادات التسجيل الأكاديمي' : 'Registration Settings';
    pageSubtitle = isAr
      ? 'فترات الحذف والإضافة، الضوابط الائتمانية للعبء الدراسي، وتجاوز المتطلبات'
      : 'Add/drop scheduling, credit hour thresholds, and prerequisite rules';
  } else if (isSecurityView) {
    pageTitle = isAr ? 'الأمان وجلسات الدخول' : 'Security & Access Settings';
    pageSubtitle = isAr
      ? 'سياسات المصادقة الثنائية (2FA)، مهلة خمول الجلسات، وتأمين الحسابات'
      : 'Two-factor authentication policies, session timeouts, and account security';
  }

  return (
    <PortalPage
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: pageTitle },
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
        {/* Info banner explaining configuration state */}
        <div className="p-4 bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="text-[#082B50] shrink-0" />
          <span>
            {isAr
              ? 'نموذج الإعدادات مهيأ للعرض. حفظ التغييرات وتطبيقها سيتفعل فور اكتمال الربط مع الواجهة الخلفية.'
              : 'Settings form prepared. Persisting and applying configuration requires backend integration.'}
          </span>
        </div>

        {isRegistrationView ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EB]">
              <div>
                <h3 className="text-sm font-bold text-[#102033]">
                  {isAr ? 'ضوابط التسجيل والعبء الأكاديمي' : 'Registration & Credit Hour Rules'}
                </h3>
                <p className="text-xs text-[#607086] mt-0.5">
                  {isAr ? 'سياسات التسجيل الذاتي للطلبة خلال الفصول الدراسية' : 'Course registration parameters for enrolled students'}
                </p>
              </div>
              <BookOpen size={20} className="text-[#082B50]" />
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
                <div>
                  <span className="font-bold text-[#102033] block">
                    {isAr ? 'تفعيل التسجيل الذاتي للفصل الدراسي القادم' : 'Enable Student Self-Registration'}
                  </span>
                  <span className="text-[#607086] text-[11px]">
                    {isAr ? 'السماح للطلاب بإضافة وحذف المقررات إلكترونياً' : 'Permit enrolled students to add/drop courses online'}
                  </span>
                </div>
                <input type="checkbox" defaultChecked disabled className="rounded text-[#082B50] w-4 h-4 cursor-not-allowed" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
                <div>
                  <span className="font-bold text-[#102033] block">
                    {isAr ? 'التحقق الآلي من المتطلبات السابقة للمقررات' : 'Enforce Prerequisite Checking Automatically'}
                  </span>
                  <span className="text-[#607086] text-[11px]">
                    {isAr ? 'منع التسجيل في المقررات المتقدمة دون اجتياز المتطلب' : 'Block registration if prerequisites are not completed'}
                  </span>
                </div>
                <input type="checkbox" defaultChecked disabled className="rounded text-[#082B50] w-4 h-4 cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#102033] mb-1">
                    {isAr ? 'الحد الأدنى للعبء الفصلي (ساعة)' : 'Minimum Term Credits'}
                  </label>
                  <input
                    type="number"
                    defaultValue={12}
                    disabled
                    className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102033] mb-1">
                    {isAr ? 'الحد الأقصى للعبء الفصلي (ساعة)' : 'Maximum Term Credits'}
                  </label>
                  <input
                    type="number"
                    defaultValue={19}
                    disabled
                    className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB] flex justify-end">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                title={isAr ? 'يتطلب ربط الواجهة الخلفية لحفظ التغييرات' : 'Requires backend connection to save changes'}
              >
                <Save size={14} />
                <span>{isAr ? 'حفظ إعدادات التسجيل' : 'Save Registration Settings'}</span>
              </button>
            </div>
          </div>
        ) : isSecurityView ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EB]">
              <div>
                <h3 className="text-sm font-bold text-[#102033]">
                  {isAr ? 'سياسات الأمان وحماية الجلسات' : 'Security Policies & Session Timeout'}
                </h3>
                <p className="text-xs text-[#607086] mt-0.5">
                  {isAr ? 'ضوابط المصادقة ومهلة الخمول للجلسات' : 'Authentication requirements and idle timeout limits'}
                </p>
              </div>
              <Shield size={20} className="text-[#082B50]" />
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
                <div>
                  <span className="font-bold text-[#102033] block">
                    {isAr ? 'إلزامية المصادقة الثنائية (2FA) للمشرفين' : 'Mandatory 2FA for Administrators'}
                  </span>
                  <span className="text-[#607086] text-[11px]">
                    {isAr ? 'طلب رمز تحقق إضافي عند تسجيل الدخول' : 'Require one-time passcode for admin logins'}
                  </span>
                </div>
                <input type="checkbox" defaultChecked disabled className="rounded text-[#082B50] w-4 h-4 cursor-not-allowed" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#102033] mb-1">
                    {isAr ? 'مهلة خمول الجلسة (دقائق)' : 'Session Idle Timeout (min)'}
                  </label>
                  <input
                    type="number"
                    defaultValue={30}
                    disabled
                    className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102033] mb-1">
                    {isAr ? 'الحد الأقصى لمحاولات الدخول الخاطئة' : 'Max Failed Login Attempts'}
                  </label>
                  <input
                    type="number"
                    defaultValue={5}
                    disabled
                    className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB] flex justify-end">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                title={isAr ? 'يتطلب ربط الواجهة الخلفية لحفظ التغييرات' : 'Requires backend connection to save changes'}
              >
                <Save size={14} />
                <span>{isAr ? 'حفظ إعدادات الأمان' : 'Save Security Settings'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EB]">
              <div>
                <h3 className="text-sm font-bold text-[#102033]">
                  {isAr ? 'إعدادات المنصة الأساسية' : 'Platform Configuration'}
                </h3>
                <p className="text-xs text-[#607086] mt-0.5">
                  {isAr ? 'اسم المنظومة، اللغة الافتراضية، وخيارات العرض' : 'System branding, default language, and presentation options'}
                </p>
              </div>
              <Settings size={20} className="text-[#082B50]" />
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#102033] mb-1">
                  {isAr ? 'اسم المنظومة الأكاديمية' : 'Platform Name'}
                </label>
                <input
                  type="text"
                  defaultValue="NABA Academy"
                  disabled
                  className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033] cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102033] mb-1">
                    {isAr ? 'اللغة الافتراضية' : 'Default Language'}
                  </label>
                  <select disabled className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033] cursor-not-allowed">
                    <option value="ar">{isAr ? 'العربية' : 'Arabic'}</option>
                    <option value="en">{isAr ? 'الإنجليزية' : 'English'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102033] mb-1">
                    {isAr ? 'الفصل الأكاديمي النشط' : 'Active Term'}
                  </label>
                  <input
                    type="text"
                    defaultValue="—"
                    disabled
                    className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB] flex justify-end">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                title={isAr ? 'يتطلب ربط الواجهة الخلفية لحفظ التغييرات' : 'Requires backend connection to save changes'}
              >
                <Save size={14} />
                <span>{isAr ? 'حفظ الإعدادات' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </PortalPage>
  );
};
