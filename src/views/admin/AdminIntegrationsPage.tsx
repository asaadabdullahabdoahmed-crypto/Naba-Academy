import React from 'react';
import { Database, Server, HardDrive, Mail, CreditCard, Cpu, Video, ShieldCheck, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminIntegrationsPageProps {
  locale: Locale;
}

export const AdminIntegrationsPage: React.FC<AdminIntegrationsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Exactly the integrations corresponding to real NABA architecture (Rule 4)
  const integrations = [
    {
      id: 'postgresql',
      nameAr: 'قاعدة البيانات (PostgreSQL)',
      nameEn: 'Database (PostgreSQL)',
      descAr: 'تخزين السجلات الأكاديمية والمستخدمين والمعاملات',
      descEn: 'Persistent relational storage for academic records and users',
      icon: Database,
      statusAr: 'غير متصل',
      statusEn: 'Disconnected',
    },
    {
      id: 'redis',
      nameAr: 'الذاكرة المؤقتة وإدارة الجلسات (Redis)',
      nameEn: 'Cache & Session Broker (Redis)',
      descAr: 'تخزين الجلسات المؤقتة، التخزين المؤقت، وإدارة قوائم الانتظار',
      descEn: 'In-memory caching, session storage, and queue processing',
      icon: Server,
      statusAr: 'غير مهيأ',
      statusEn: 'Not Configured',
    },
    {
      id: 'object-storage',
      nameAr: 'التخزين السحابي للوثائق والملفات (Object Storage)',
      nameEn: 'Object Storage Service',
      descAr: 'حفظ الواجبات والملفات المرفوعة والوسائط التعليمية',
      descEn: 'Storage repository for course attachments and uploaded media',
      icon: HardDrive,
      statusAr: 'غير مهيأ',
      statusEn: 'Not Configured',
    },
    {
      id: 'smtp',
      nameAr: 'خدمة البريد الإلكتروني (SMTP)',
      nameEn: 'Email Gateway (SMTP)',
      descAr: 'إرسال إشعارات المنصة، استعادة الحسابات، ورسائل التحقق',
      descEn: 'Notification delivery, password resets, and verification messages',
      icon: Mail,
      statusAr: 'غير مهيأ',
      statusEn: 'Not Configured',
    },
    {
      id: 'payment',
      nameAr: 'بوابة الدفع الإلكتروني (Payment Provider)',
      nameEn: 'Payment Gateway Provider',
      descAr: 'معالجة تسوية الرسوم الدراسية وإشعارات الدفع الرقمي',
      descEn: 'Tuition fee settlement and digital payment transactions',
      icon: CreditCard,
      statusAr: 'غير مهيأ',
      statusEn: 'Not Configured',
    },
    {
      id: 'ai',
      nameAr: 'خدمة الذكاء الاصطناعي (AI Integration)',
      nameEn: 'AI Integration Service',
      descAr: 'المعالجة الذكية وخدمات المراقبة والتحليل الأكاديمي',
      descEn: 'Intelligent processing, proctoring, and academic analytics',
      icon: Cpu,
      statusAr: 'غير مهيأ',
      statusEn: 'Not Configured',
    },
    {
      id: 'live-learning',
      nameAr: 'مزود الفصول الافتراضية (Live-learning Provider)',
      nameEn: 'Live-Learning Provider',
      descAr: 'إدارة جلسات البث الحي والمحاضرات التفاعلية المباشرة',
      descEn: 'Interactive live lectures and virtual classroom infrastructure',
      icon: Video,
      statusAr: 'غير مهيأ',
      statusEn: 'Not Configured',
    },
  ];

  return (
    <PortalPage
      title={isAr ? 'الربط والتكامل' : 'Integrations'}
      subtitle={
        isAr
          ? 'حالة التهيئة والربط لخدمات البنية التحتية والأنظمة المعتمدة للمنظومة'
          : 'Configuration and connectivity state for institutional architecture and services'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'الربط والتكامل' : 'Integrations' },
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
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#102033]">
                      {isAr ? item.nameAr : item.nameEn}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF3F8] text-[#607086] border border-[#DCE3EB]">
                      {isAr ? item.statusAr : item.statusEn}
                    </span>
                  </div>
                  <p className="text-xs text-[#607086] mt-0.5">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="px-3.5 py-1.5 bg-[#EFF3F8] text-[#607086] cursor-not-allowed border border-[#DCE3EB] text-xs font-bold rounded-lg self-start sm:self-center"
                title={isAr ? 'يتطلب ربط الواجهة الخلفية لتفعيل الاختبار' : 'Requires backend connection to test'}
              >
                {isAr ? 'فحص الاتصال' : 'Test Connection'}
              </button>
            </div>
          );
        })}
      </div>
    </PortalPage>
  );
};
