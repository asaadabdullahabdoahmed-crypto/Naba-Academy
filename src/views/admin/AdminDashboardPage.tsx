import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  UserPlus,
  Activity,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  FileCheck2,
  PieChart,
  History,
  UserCheck,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminDashboardPageProps {
  locale: Locale;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // 6 Verified Management Cards corresponding directly to existing App.tsx routes
  const coreCards = [
    {
      path: `/${locale}/admin/users`,
      icon: Users,
      titleAr: 'المستخدمون',
      titleEn: 'Users Directory',
      descAr: 'إدارة حسابات الطلاب وأعضاء هيئة التدريس',
      descEn: 'Manage students, faculty, and administrative staff',
    },
    {
      path: `/${locale}/admin/programs`,
      icon: Award,
      titleAr: 'البرامج الأكاديمية',
      titleEn: 'Academic Programs',
      descAr: 'إدارة البرامج والتخصصات والخطط الدراسية',
      descEn: 'Manage degree curricula and department specializations',
    },
    {
      path: `/${locale}/admin/courses`,
      icon: BookOpen,
      titleAr: 'الدورات والمقررات',
      titleEn: 'Courses & Catalog',
      descAr: 'إضافة وإدارة المقررات والشعب الأكاديمية',
      descEn: 'Master catalog for course offerings and sections',
    },
    {
      path: `/${locale}/admin/finance`,
      icon: CreditCard,
      titleAr: 'الشؤون المالية',
      titleEn: 'Financial Ops',
      descAr: 'المدفوعات، الفواتير، والسجلات المالية',
      descEn: 'Tuition fees, student invoicing, and payment logs',
    },
    {
      path: `/${locale}/admin/assessments`,
      icon: FileCheck2,
      titleAr: 'الاختبارات والتقييم',
      titleEn: 'Exams & Assessment',
      descAr: 'بنوك الأسئلة، الاختبارات، والمراقبة الإلكترونية',
      descEn: 'Question banks, exam scheduling, and proctoring',
    },
    {
      path: `/${locale}/admin/admissions`,
      icon: UserCheck,
      titleAr: 'القبول والتسجيل',
      titleEn: 'Admissions & Intake',
      descAr: 'متابعة وفرز طلبات القبول والالتحاق',
      descEn: 'Track applicant intake and enrollment approvals',
    },
  ];

  return (
    <PortalPage
      title={isAr ? 'لوحة التحكم الإدارية' : 'Admin Control Panel'}
      subtitle={
        isAr
          ? 'مرحباً بك في النظام الإداري لأكاديمية نبا'
          : 'Welcome to NABA Academy Central Administration'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'لوحة التحكم' : 'Dashboard' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/admin/users`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <UserPlus size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'إضافة مستخدم جديد' : 'New User Account'}</span>
          </Link>
          <Link
            to={`/${locale}/admin/system-status`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
          >
            <Activity size={14} />
            <span>{isAr ? 'صحة النظام' : 'System Health'}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Six Main Management Cards (3 columns x 2 rows) */}
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
                    <span>{isAr ? 'فتح الوحدة' : 'Open Module'}</span>
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

        {/* Lower Split: Analytics Area & Recent Activity (Factual Empty States) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Analytics Chart Container (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DCE3EB]">
              <div>
                <h4 className="text-sm font-bold text-[#082B50]">
                  {isAr ? 'معدل التسجيل في البرامج الأكاديمية' : 'Program Enrollment Trends'}
                </h4>
                <p className="text-[11px] text-[#607086] mt-0.5">
                  {isAr ? 'مؤشرات القبول والتسجيل الأكاديمي' : 'Academic admissions and enrollment metrics'}
                </p>
              </div>
            </div>

            {/* Factual Operational Empty State (Required by Strict Rule) */}
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <PieChart size={24} />
              </div>
              <h5 className="text-xs font-bold text-[#102033] mb-1">
                {isAr ? 'ستظهر الإحصاءات عند توفر البيانات التشغيلية.' : 'Statistics will appear when operational data becomes available.'}
              </h5>
              <p className="text-[11px] text-[#607086] max-w-sm mx-auto">
                {isAr
                  ? 'ستظهر الرسوم البيانية ومؤشرات التسجيل عند بدء تسجيل البيانات في النظام.'
                  : 'Enrollment charts will populate when operational records are available in the system.'}
              </p>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB] flex items-center justify-between text-xs text-[#607086]">
              <span>{isAr ? 'بيانات النظام المركزي' : 'Central System Data'}</span>
              <span className="font-semibold text-[#607086]">{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
            </div>
          </div>

          {/* Side Panel: أحدث الأنشطة (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DCE3EB]">
                <h4 className="text-sm font-bold text-[#082B50]">
                  {isAr ? 'أحدث الأنشطة والعمليات' : 'Recent Activities'}
                </h4>
                <Link
                  to={`/${locale}/admin/audit`}
                  className="text-xs font-semibold text-[#082B50] hover:text-[#174F89] flex items-center gap-1"
                >
                  <span>{isAr ? 'سجل التدقيق' : 'Audit Log'}</span>
                  <ArrowIcon size={12} />
                </Link>
              </div>

              {/* Factual Activity Empty State */}
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#607086] flex items-center justify-center mx-auto mb-2">
                  <History size={20} />
                </div>
                <h5 className="text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'لا توجد أنشطة مسجلة حاليًا' : 'No recorded activity yet.'}
                </h5>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'ستوثق العمليات الإدارية وسجلات التدقيق هنا عند حدوثها.' : 'Administrative events and audit logs will be recorded here.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#DCE3EB]">
              <Link
                to={`/${locale}/admin/audit`}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#EFF3F8] hover:bg-[#DCE3EB]/60 text-[#082B50] text-xs font-semibold transition-colors"
              >
                <History size={13} />
                <span>{isAr ? 'عرض سجل الرقابة والعمليات' : 'View Full Audit Trail'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
