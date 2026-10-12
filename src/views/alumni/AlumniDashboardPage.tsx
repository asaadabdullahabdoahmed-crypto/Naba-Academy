import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  FileText,
  Briefcase,
  Calendar,
  Users,
  LifeBuoy,
  QrCode,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  GraduationCap,
  Bell,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AlumniDashboardPageProps {
  locale: Locale;
}

export const AlumniDashboardPage: React.FC<AlumniDashboardPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const coreCards = [
    {
      path: `/${locale}/alumni/certificate`,
      icon: Award,
      titleAr: 'الشهادة الجدارية الرقمية',
      titleEn: 'Digital Degree Certificate',
      descAr: 'التحقق الرقمي والوثيقة الجدارية الرسمية المعتمدة',
      descEn: 'Digital certificate verification and official degree credential',
    },
    {
      path: `/${locale}/alumni/transcript`,
      icon: FileText,
      titleAr: 'السجل الأكاديمي والوثائق',
      titleEn: 'Official Transcript & Records',
      descAr: 'السجل الأكاديمي الشامل وكشوف الدرجات الرسمية',
      descEn: 'Comprehensive academic transcript and graduation records',
    },
    {
      path: `/${locale}/alumni/jobs`,
      icon: Briefcase,
      titleAr: 'الفرص الوظيفية والتدريب',
      titleEn: 'Career & Opportunities',
      descAr: 'بوابة الشواغر المهنية وبرامج التدريب والتأهيل',
      descEn: 'Professional job postings and career advancement programs',
    },
    {
      path: `/${locale}/alumni/events`,
      icon: Calendar,
      titleAr: 'الملتقيات والفعاليات',
      titleEn: 'Events & Reunions',
      descAr: 'ملتقيات الخريجين السنوية والندوات المهنية المستمرة',
      descEn: 'Annual alumni gatherings, conferences, and career seminars',
    },
    {
      path: `/${locale}/alumni/directory`,
      icon: Users,
      titleAr: 'شبكة ودليل الخريجين',
      titleEn: 'Alumni Network & Directory',
      descAr: 'التواصل المهني وبناء العلاقات بين خريجي الأكاديمية',
      descEn: 'Professional networking and institutional directory',
    },
    {
      path: `/${locale}/alumni/support`,
      icon: LifeBuoy,
      titleAr: 'التوجيه المهني والدعم',
      titleEn: 'Career Guidance & Support',
      descAr: 'الإرشاد المهني والتواصل مع وحدة علاقات الخريجين',
      descEn: 'Career mentorship and support from Alumni Relations unit',
    },
  ];

  return (
    <PortalPage
      title={isAr ? 'لوحة تحكم الخريج' : 'Alumni Workspace'}
      subtitle={
        isAr
          ? 'الوصول إلى الوثائق الرسمية، السجل الأكاديمي، والخدمات المهنية للأكاديمية'
          : 'Access official graduation credentials, transcripts, and institutional alumni services'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
        { label: isAr ? 'لوحة التحكم' : 'Dashboard' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/alumni/certificate`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <QrCode size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'التحقق من الشهادة' : 'Verify Certificate'}</span>
          </Link>
          <Link
            to={`/${locale}/alumni/support`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
          >
            <LifeBuoy size={14} />
            <span>{isAr ? 'الدعم والإرشاد' : 'Support Desk'}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Core Workspace Cards (3 columns x 2 rows) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.path}
                className="bg-white p-5 rounded-2xl border border-[#DCE3EB] hover:border-[#082B50]/40 hover:shadow-xs transition-all flex items-start justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#102033] group-hover:text-[#082B50] transition-colors mb-1">
                    {isAr ? card.titleAr : card.titleEn}
                  </h4>
                  <p className="text-[11px] text-[#607086] leading-relaxed max-w-[200px]">
                    {isAr ? card.descAr : card.descEn}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#082B50] group-hover:text-[#174F89]">
                    <span>{isAr ? 'فتح الخدمة' : 'Open Service'}</span>
                    <ArrowIcon size={12} />
                  </div>
                </div>

                <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#082B50] group-hover:bg-[#082B50] group-hover:text-[#D6A53A] flex items-center justify-center shrink-0 transition-colors">
                  <Icon size={22} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Lower Split: Academic Credential Status & Recent Notices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Academic Credential Status (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCE3EB]">
              <div>
                <h4 className="text-sm font-bold text-[#082B50]">
                  {isAr ? 'حالة الوثيقة والسجل الأكاديمي' : 'Degree Credential & Transcript Status'}
                </h4>
                <p className="text-[11px] text-[#607086] mt-0.5">
                  {isAr ? 'بيانات الاعتماد الأكاديمي وتوثيق التخرج' : 'Institutional graduation verification and record readiness'}
                </p>
              </div>
            </div>

            {/* Factual Institutional Empty State */}
            <div className="py-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <GraduationCap size={26} />
              </div>
              <h5 className="text-xs font-bold text-[#102033] mb-1">
                {isAr ? 'في انتظار استرجاع السجل الأكاديمي' : 'Awaiting Academic Records Sync'}
              </h5>
              <p className="text-[11px] text-[#607086] max-w-sm mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر بيانات التخرج والشهادة الجدارية والسجل الأكاديمي الرقمي فور استرجاع بيانات الحساب من قاعدة البيانات.'
                  : 'Graduation status, digital diploma, and official transcript will populate once connected to the backend database.'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB] flex items-center justify-between text-xs text-[#607086]">
              <span>{isAr ? 'السجل الأكاديمي المعتمد' : 'Official Academic Record'}</span>
              <span className="font-semibold text-[#607086]">{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
            </div>
          </div>

          {/* Side Panel: Notices & Updates (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DCE3EB]">
                <h4 className="text-sm font-bold text-[#082B50]">
                  {isAr ? 'أحدث المستجدات والإعلانات' : 'Notices & Announcements'}
                </h4>
                <Link
                  to={`/${locale}/alumni/events`}
                  className="text-xs font-semibold text-[#082B50] hover:text-[#174F89] flex items-center gap-1"
                >
                  <span>{isAr ? 'الفعاليات' : 'Events'}</span>
                  <ArrowIcon size={12} />
                </Link>
              </div>

              {/* Factual Empty State */}
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-2">
                  <Bell size={20} />
                </div>
                <h5 className="text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'لا توجد إعلانات نشطة حاليًا' : 'No Active Announcements'}
                </h5>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'ستنشر إعلانات رابطة الخريجين وملتقيات التوظيف هنا عند اعتمادها.' : 'Official alumni announcements and job fair updates will appear here.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB]">
              <Link
                to={`/${locale}/alumni/events`}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] text-xs font-semibold transition-colors"
              >
                <Calendar size={13} />
                <span>{isAr ? 'عرض جدول الفعاليات' : 'View Events Calendar'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
