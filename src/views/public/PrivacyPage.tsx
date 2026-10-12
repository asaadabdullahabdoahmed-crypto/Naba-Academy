import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface PrivacyPageProps {
  locale: Locale;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'الخصوصية وحماية البيانات' : 'Data Privacy'}</span>
        </div>
        <h1 className="text-3xl font-black text-[#082B50]">
          {isAr ? 'سياسة الخصوصية وسرية المعلومات' : 'Privacy & Data Protection Policy'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'التزام أكاديمية نبا بحماية خصوصية الطلاب والمنسوبين وسرية السجلات الأكاديمية'
            : 'NABA Academy commitment to safeguarding personal data and academic records'}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#DCE3EB] p-8 md:p-10 space-y-6 text-xs md:text-sm text-[#344054] leading-relaxed shadow-xs">
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#102033] flex items-center gap-2">
            <Lock size={18} className="text-[#082B50]" />
            <span>{isAr ? '1. جمع ومعالجة البيانات الأكاديمية' : '1. Academic Data Collection & Processing'}</span>
          </h2>
          <p className="text-[#607086] text-xs leading-relaxed">
            {isAr
              ? 'تجمع الأكاديمية فقط البيانات الشخصية والأكاديمية اللازمة لإدارة عمليات القبول والتسجيل، وحضور المحاضرات، ورصد الدرجات والتقييمات، وإصدار الوثائق الرسمية.'
              : 'We collect only personal, identification, and academic performance data strictly necessary for admissions, course delivery, grade recording, and degree credentialing.'}
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#DCE3EB]">
          <h2 className="text-base font-bold text-[#102033] flex items-center gap-2">
            <Shield size={18} className="text-[#174F89]" />
            <span>{isAr ? '2. أمن وحماية السجلات الإلكترونية' : '2. Security & Record Confidentiality'}</span>
          </h2>
          <p className="text-[#607086] text-xs leading-relaxed">
            {isAr
              ? 'تخضع كافة السجلات الأكاديمية ومعاملات تسجيل الدخول لمعايير التشفير الصارمة والتحكم في صلاحيات الوصول وفق أدوار المستخدمين المعتمدة في النظام.'
              : 'All digital records, proctoring telemetry, and database sessions are encrypted in transit and at rest with role-based access control.'}
          </p>
        </div>

        <div className="space-y-2 pt-4 border-t border-[#DCE3EB]">
          <h2 className="text-base font-bold text-[#102033] flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#D6A53A]" />
            <span>{isAr ? '3. حقوق أصحاب البيانات' : '3. Learner Rights & Access'}</span>
          </h2>
          <p className="text-[#607086] text-xs leading-relaxed">
            {isAr
              ? 'يحق لكل طالب مراجعة سجلاته الأكاديمية والتحقق من صحة بياناته وتحديث معلومات الاتصال من خلال بوابة الطالب الموحدة.'
              : 'Enrolled students and faculty have the right to inspect, verify, and request corrections to their academic profile information via their authenticated portal.'}
          </p>
        </div>
      </div>
    </div>
  );
};
