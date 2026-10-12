import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Award,
  AlertCircle,
  FileCheck,
  Scale,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface DepartmentDashboardPageProps {
  locale: Locale;
}

export const DepartmentDashboardPage: React.FC<DepartmentDashboardPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <PortalPage
      title={isAr ? 'لوحة تحكم رئيس القسم' : 'Department Chair Dashboard'}
      subtitle={
        isAr
          ? 'إدارة البرامج الأكاديمية، متابعة أعضاء هيئة التدريس، ومراقبة الجودة والاعتماد الأكاديمي'
          : 'Oversee academic programs, faculty allocations, student petitions, and quality accreditation'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: isAr ? 'لوحة التحكم' : 'Dashboard' },
      ]}
      locale={locale}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to={`/${locale}/department/enrollments`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <ClipboardCheck size={14} className="text-[#D6A53A]" />
            <span>{isAr ? 'اعتماد الطلبات' : 'Review Petitions'}</span>
          </Link>
          <Link
            to={`/${locale}/department/reports`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
          >
            <Award size={14} />
            <span>{isAr ? 'تقارير القسم' : 'Department Reports'}</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Institutional Metrics Overview (Neutral honest indicators) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'أعضاء هيئة التدريس' : 'Department Faculty'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'الكادر الأكاديمي المعتمد' : 'Appointed faculty staff'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'البرامج الأكاديمية النشطة' : 'Active Degree Programs'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <GraduationCap size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'الخطط الدراسية المعتمدة' : 'Accredited study plans'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'الشُعب والمقررات المطروحة' : 'Course Offerings & Sections'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <BookOpen size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'الفصل الدراسي الحالي' : 'Current academic term'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#607086] font-medium">
                {isAr ? 'طلبات بانتظار الاعتماد' : 'Pending Petitions'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                <ClipboardCheck size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#102033] font-mono">—</div>
            <p className="text-[11px] text-[#607086] mt-1">
              {isAr ? 'طلبات التسجيل والاستثناءات' : 'Enrollment & waiver petitions'}
            </p>
          </div>
        </div>

        {/* Quick Institutional Action Pathways */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to={`/${locale}/department/faculty`}
            className="group bg-white rounded-2xl border border-[#DCE3EB] p-5 hover:border-[#174F89] hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] group-hover:bg-[#082B50] group-hover:text-white transition-colors flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#102033] group-hover:text-[#174F89] transition-colors">
                  {isAr ? 'هيئة التدريس والأنصبة' : 'Faculty & Workloads'}
                </h3>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'متابعة توزيع الساعات التدريسية' : 'View teaching hours & rosters'}
                </p>
              </div>
            </div>
            <ArrowIcon size={14} className="text-[#607086] group-hover:text-[#174F89] transition-colors" />
          </Link>

          <Link
            to={`/${locale}/department/courses`}
            className="group bg-white rounded-2xl border border-[#DCE3EB] p-5 hover:border-[#174F89] hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] group-hover:bg-[#082B50] group-hover:text-white transition-colors flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#102033] group-hover:text-[#174F89] transition-colors">
                  {isAr ? 'جدولة الشُعب والمقررات' : 'Course & Section Scheduling'}
                </h3>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'متابعة الطاقات الاستيعابية والقاعات' : 'Monitor seat caps & rooms'}
                </p>
              </div>
            </div>
            <ArrowIcon size={14} className="text-[#607086] group-hover:text-[#174F89] transition-colors" />
          </Link>

          <Link
            to={`/${locale}/department/appeals`}
            className="group bg-white rounded-2xl border border-[#DCE3EB] p-5 hover:border-[#174F89] hover:shadow-xs transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] group-hover:bg-[#082B50] group-hover:text-white transition-colors flex items-center justify-center">
                <Scale size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#102033] group-hover:text-[#174F89] transition-colors">
                  {isAr ? 'لجنة التظلمات الأكاديمية' : 'Academic Appeals Committee'}
                </h3>
                <p className="text-[11px] text-[#607086]">
                  {isAr ? 'النظر في تظلمات نتائج المقررات' : 'Review grade appeals & petitions'}
                </p>
              </div>
            </div>
            <ArrowIcon size={14} className="text-[#607086] group-hover:text-[#174F89] transition-colors" />
          </Link>
        </div>

        {/* Main Workspaces Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Degree Programs & Curricula Overview */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EB] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#102033]">
                    {isAr ? 'البرامج الأكاديمية والخطط المعتمدة' : 'Academic Programs & Curricula'}
                  </h2>
                  <p className="text-[11px] text-[#607086]">
                    {isAr ? 'مزامنة مع عمادة القبول والتسجيل' : 'Synchronized with University Registrar'}
                  </p>
                </div>
              </div>
              <Link
                to={`/${locale}/department/programs`}
                className="text-xs text-[#174F89] hover:text-[#082B50] font-semibold flex items-center gap-1"
              >
                <span>{isAr ? 'عرض البرامج' : 'View Programs'}</span>
                <ArrowIcon size={12} />
              </Link>
            </div>

            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <GraduationCap size={22} />
              </div>
              <p className="text-xs font-bold text-[#102033]">
                {isAr ? 'لا توجد برامج أكاديمية نشطة مسجلة حالياً' : 'No active academic programs currently loaded'}
              </p>
              <p className="text-[11px] text-[#607086] mt-1 max-w-sm mx-auto">
                {isAr
                  ? 'يتم استيراد الخطط الدراسية المعتمدة تلقائياً من نظام إدارة البرامج الأكاديمية بالجامعة.'
                  : 'Approved study plans are synchronized automatically from the university academic programs registry.'}
              </p>
            </div>
          </div>

          {/* Enrollment Approvals & Student Petitions */}
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EB] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                  <ClipboardCheck size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#102033]">
                    {isAr ? 'طلبات التسجيل والاستثناءات' : 'Enrollment Petitions & Waivers'}
                  </h2>
                  <p className="text-[11px] text-[#607086]">
                    {isAr ? 'قرارات رئيس القسم الأكاديمية' : 'Department Chair decisions'}
                  </p>
                </div>
              </div>
              <Link
                to={`/${locale}/department/enrollments`}
                className="text-xs text-[#174F89] hover:text-[#082B50] font-semibold flex items-center gap-1"
              >
                <span>{isAr ? 'إدارة الطلبات' : 'Manage Petitions'}</span>
                <ArrowIcon size={12} />
              </Link>
            </div>

            <div className="py-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <ClipboardCheck size={22} />
              </div>
              <p className="text-xs font-bold text-[#102033]">
                {isAr ? 'لا توجد طلبات معلقة بانتظار الاعتماد' : 'No pending petitions awaiting decision'}
              </p>
              <p className="text-[11px] text-[#607086] mt-1 max-w-sm mx-auto">
                {isAr
                  ? 'ستظهر هنا طلبات استثناء المتطلبات السابقة ورفع الساعات المحولة من المرشدين الأكاديميين.'
                  : 'Prerequisite waivers and credit overload requests routed by academic advisors will appear here.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quality & Accreditation Governance Notice */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} className="text-[#D6A53A]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#102033]">
                {isAr ? 'معايير الجودة والاعتماد الأكاديمي (NCAAA)' : 'Academic Quality & Accreditation Standards (NCAAA)'}
              </h3>
              <p className="text-[11px] text-[#607086] mt-0.5">
                {isAr
                  ? 'تخضع تقارير المقررات ومصفوفة مخرجات التعلم لدورات التدقيق الدورية لعمادة التطوير والجودة.'
                  : 'Course dossiers and learning outcomes matrices are reviewed in compliance with quality assurance cycles.'}
              </p>
            </div>
          </div>
          <Link
            to={`/${locale}/department/quality`}
            className="shrink-0 px-3.5 py-2 bg-[#EFF3F8] hover:bg-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
          >
            {isAr ? 'مؤشرات الجودة' : 'Quality Indicators'}
          </Link>
        </div>
      </div>
    </PortalPage>
  );
};
