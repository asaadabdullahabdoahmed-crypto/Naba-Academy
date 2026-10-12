import React, { useState } from 'react';
import { Settings, Shield, Bell, CheckCircle2, Lock, Save, ShieldCheck } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface DepartmentSettingsPageProps {
  locale: Locale;
}

export const DepartmentSettingsPage: React.FC<DepartmentSettingsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  return (
    <PortalPage
      title={isAr ? 'إعدادات وسياسات القسم الأكاديمية' : 'Department Policies & Academic Settings'}
      subtitle={
        isAr
          ? 'ضوابط الأنصبة التدريسية، قواعد قبول الاستثناءات، وصلاحيات اللجان الأكاديمية'
          : 'Teaching workload thresholds, overload approval rules, and committee jurisdiction'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'إعدادات القسم' : 'Settings' },
      ]}
      locale={locale}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Academic Policies Container */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#DCE3EB]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? 'ضوابط التسجيل والأنصبة الأكاديمية' : 'Workload & Registration Policies'}
              </h3>
              <p className="text-[11px] text-[#607086]">
                {isAr ? 'اللوائح التنظيمية المعتمدة للقسم' : 'Regulatory policies for the department'}
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
              <div>
                <span className="font-semibold text-[#102033] block">
                  {isAr ? 'الحد الأقصى للعبء التدريسي (14 ساعة معتمدة)' : 'Maximum Faculty Teaching Load (14 Credit Hours)'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'تنبيه رئيس القسم عند تجاوز النصاب النظامي' : 'Alert when workload exceeds standard limit'}
                </span>
              </div>
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="rounded text-[#082B50] focus:ring-[#174F89] cursor-not-allowed opacity-70"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
              <div>
                <span className="font-semibold text-[#102033] block">
                  {isAr ? 'اشتراط موافقة رئيس القسم لرفع الساعات لأكثر من 18 ساعة' : 'Require Chair Approval for Student Overloads (>18 Credits)'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'تحويل طلبات الطلاب المتفوقين أو المتوقع تخرجهم آلياً' : 'Route graduating or high GPA overload requests'}
                </span>
              </div>
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="rounded text-[#082B50] focus:ring-[#174F89] cursor-not-allowed opacity-70"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#DCE3EB]">
              <div>
                <span className="font-semibold text-[#102033] block">
                  {isAr ? 'إشعار فوري عند تسجيل تظلم طالب جديد' : 'Instant Notification on New Student Grade Dispute'}
                </span>
                <span className="text-[11px] text-[#607086]">
                  {isAr ? 'إرسال بريد إلكتروني لرئيس القسم وأمين لجنة التظلمات' : 'Notify chair and committee secretary'}
                </span>
              </div>
              <input
                type="checkbox"
                defaultChecked
                disabled
                className="rounded text-[#082B50] focus:ring-[#174F89] cursor-not-allowed opacity-70"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-xl text-xs font-bold transition-colors"
              title={isAr ? 'التعديل معطل لعدم وجود اتصال مباشر بالنظام الإداري المركزي' : 'Settings modifications disabled without central administration link'}
            >
              <Save size={14} />
              <span>{isAr ? 'حفظ السياسات' : 'Save Policies'}</span>
            </button>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="bg-[#EFF3F8] rounded-2xl border border-[#DCE3EB] p-4 text-xs text-[#607086] flex items-center gap-3">
          <ShieldCheck size={18} className="text-[#082B50] shrink-0" />
          <span>
            {isAr
              ? 'تخضع التعديلات الجوهرية على الخطط الدراسية والأنصبة الأكاديمية لموافقة مجلس الكلية ومجلس الجامعة.'
              : 'Substantive modifications to study plans and workload policies require College Council and University Senate ratification.'}
          </span>
        </div>
      </div>
    </PortalPage>
  );
};
