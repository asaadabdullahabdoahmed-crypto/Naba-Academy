import React from 'react';
import { useLocation } from 'react-router-dom';
import { Server, Activity, Database, AlertCircle, HardDrive, Mail, ShieldAlert, Cpu } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminSystemHealthPageProps {
  locale: Locale;
}

export const AdminSystemHealthPage: React.FC<AdminSystemHealthPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();

  const isAssessmentsView = location.pathname.includes('/admin/assessments');

  const coreServices = isAssessmentsView
    ? [
        {
          nameAr: 'محرك الاختبارات والتقييم',
          nameEn: 'Examination & Assessment Engine',
          roleAr: 'جدولة الاختبارات، المؤقت الزمني، وحفظ الإجابات',
          roleEn: 'Exam scheduling, countdown timer, and response persistence',
          statusAr: 'غير مهيأ',
          statusEn: 'Not Configured',
          icon: ShieldAlert,
        },
        {
          nameAr: 'خدمة المراقبة والنزاهة الأكاديمية',
          nameEn: 'Academic Integrity & Proctoring Service',
          roleAr: 'التحقق من جلسات الاختبارات الإلكترونية والنزاهة',
          roleEn: 'Online examination session verification and integrity rules',
          statusAr: 'غير مهيأ',
          statusEn: 'Not Configured',
          icon: Cpu,
        },
        {
          nameAr: 'مستودع بنك الأسئلة',
          nameEn: 'Question Bank Repository',
          roleAr: 'إدارة وتصنيف الأسئلة حسب المقررات والوحدات',
          roleEn: 'Question item management and unit-level tagging',
          statusAr: 'غير متوفر حاليًا',
          statusEn: 'Currently Unavailable',
          icon: Database,
        },
      ]
    : [
        {
          nameAr: 'خادم الواجهة البرمجية (Backend API)',
          nameEn: 'Backend API Service',
          roleAr: 'معالجة طلبات البوابات وتوفير نقاط الاتصال المركزية',
          roleEn: 'Central application endpoints and request routing',
          statusAr: 'غير متصل',
          statusEn: 'Disconnected',
          icon: Server,
        },
        {
          nameAr: 'قاعدة البيانات الأساسية (PostgreSQL)',
          nameEn: 'Primary Database (PostgreSQL)',
          roleAr: 'حفظ واسترجاع سجلات الطلاب والمقررات والبيانات الأكاديمية',
          roleEn: 'Academic, student, and institutional record storage',
          statusAr: 'غير متصل',
          statusEn: 'Disconnected',
          icon: Database,
        },
        {
          nameAr: 'الذاكرة المؤقتة (Redis Cache)',
          nameEn: 'Cache Broker (Redis)',
          roleAr: 'إدارة الجلسات السريعة ومزامنة الأحداث اللحظية',
          roleEn: 'Session state cache and fast event brokering',
          statusAr: 'غير مهيأ',
          statusEn: 'Not Configured',
          icon: Activity,
        },
        {
          nameAr: 'التخزين السحابي للملفات (Object Storage)',
          nameEn: 'Object Storage Repository',
          roleAr: 'حفظ مستودعات الوثائق والملفات المرفوعة',
          roleEn: 'Document repository and file upload persistence',
          statusAr: 'غير مهيأ',
          statusEn: 'Not Configured',
          icon: HardDrive,
        },
        {
          nameAr: 'خادم البريد الإلكتروني (SMTP Gateway)',
          nameEn: 'Email Gateway (SMTP)',
          roleAr: 'إرسال الإشعارات البريدية وتنبيهات الحسابات',
          roleEn: 'System email dispatch and account alerts',
          statusAr: 'غير مهيأ',
          statusEn: 'Not Configured',
          icon: Mail,
        },
      ];

  const pageTitle = isAssessmentsView
    ? (isAr ? 'التقييم والاختبارات' : 'Assessments & Examination')
    : (isAr ? 'حالة النظام والخوادم' : 'System & Infrastructure Status');

  const pageSubtitle = isAssessmentsView
    ? (isAr
        ? 'حالة محركات الاختبارات، بنوك الأسئلة، وخدمات المراقبة والتقييم'
        : 'Status of examination engines, question banks, and proctoring components')
    : (isAr
        ? 'المتابعة المباشرة لجاهزية خدمات البنية التحتية والربط الفني'
        : 'Technical runtime readiness and connectivity state for core infrastructure');

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
          <span>{isAr ? 'غير متصل بالواجهة الخلفية' : 'Backend Disconnected'}</span>
        </div>
      }
    >
      <div className="space-y-4">
        {coreServices.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#102033]">
                    {isAr ? s.nameAr : s.nameEn}
                  </h4>
                  <p className="text-xs text-[#607086] mt-0.5">
                    {isAr ? s.roleAr : s.roleEn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#607086]" />
                <span className="text-xs font-bold text-[#607086] bg-[#EFF3F8] px-2.5 py-1 rounded-full border border-[#DCE3EB]">
                  {isAr ? s.statusAr : s.statusEn}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </PortalPage>
  );
};
