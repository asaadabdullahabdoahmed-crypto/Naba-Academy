import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  FileText,
  BarChart3,
  GraduationCap,
  Award,
  CheckCheck,
  ShieldCheck,
  Download,
  FileCheck2,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminReportsPageProps {
  locale: Locale;
}

export const AdminReportsPage: React.FC<AdminReportsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();

  const isDocumentsView = location.pathname.includes('/admin/documents');
  const isGraduationView = location.pathname.includes('/admin/graduation');
  const isGradesView = location.pathname.includes('/admin/grades');

  let pageTitle = isAr ? 'التقارير المؤسسية والإحصائية' : 'Institutional Reports & Intelligence';
  let pageSubtitle = isAr
    ? 'التقارير الإحصائية الرسمية، مؤشرات الأداء الأكاديمي، ونشرات الجودة والاعتماد'
    : 'Official institutional reporting, academic performance indicators, and accreditation filings';
  let MainIcon = BarChart3;

  if (isDocumentsView) {
    pageTitle = isAr ? 'الوثائق والأختام الرقمية' : 'Document Verification & Digital Seals';
    pageSubtitle = isAr
      ? 'منظومة التوثيق الرقمي، الأختام المشفرة، والتحقق الفوري من صحة السجلات والشهادات'
      : 'Cryptographic document verification, digital seals, and immediate transcript authentication';
    MainIcon = FileCheck2;
  } else if (isGraduationView) {
    pageTitle = isAr ? 'شؤون الخريجين ومنح الدرجات' : 'Graduation Operations & Degree Conferral';
    pageSubtitle = isAr
      ? 'تدقيق متطلبات التخرج، إصدار الوثائق الجدارية، واعتماد قرارات منح الدرجات العلمية'
      : 'Graduation audit, degree diploma issuance, and academic conferral council approvals';
    MainIcon = GraduationCap;
  } else if (isGradesView) {
    pageTitle = isAr ? 'معايير النتائج وحوكمة الدرجات' : 'Grade Governance & Evaluation Standards';
    pageSubtitle = isAr
      ? 'سلم الدرجات المعتمد، خوارزميات احتساب المعدل التراكمي، وسياسات الرصد النهائي'
      : 'Grading scale governance, GPA calculation algorithms, and grade submission compliance';
    MainIcon = CheckCheck;
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
      <div className="space-y-6">
        {/* Institutional Section Card */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EB] mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">{pageTitle}</h3>
              <p className="text-xs text-[#607086] mt-0.5">{pageSubtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
              <MainIcon size={20} />
            </div>
          </div>

          {/* Factual Empty State */}
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <MainIcon size={26} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isDocumentsView
                ? (isAr ? 'لا توجد طلبات تصديق وثائق معلقة' : 'No Pending Document Authentications')
                : isGraduationView
                ? (isAr ? 'لم تبدأ فترة تدقيق التخرج للفصل الحالي بعد' : 'Graduation Audit Window Not Yet Active')
                : isGradesView
                ? (isAr ? 'فترات رصد واعتماد الدرجات مغلقة حالياً' : 'Grade Submission Cycles Currently Closed')
                : (isAr ? 'ستصدر التقارير الرسمية عند اكتمال بيانات الدورة' : 'Official Reports Available Upon Cycle Completion')}
            </h4>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isDocumentsView
                ? (isAr
                    ? 'يتم إصدار الأختام الرقمية المشفرة وتوثيق الشهادات الجدارية والسجلات الأكاديمية عبر منصة التوثيق الرسمية فور صدور الوثائق.'
                    : 'Cryptographic seals and official document certifications generate automatically via the verification authority.')
                : isGraduationView
                ? (isAr
                    ? 'يتم تفعيل مسار تدقيق الخريجين وإصدار وثائق التخرج الرسمية بعد اعتماد كشوف الدرجات النهائية من مجلس الجامعة.'
                    : 'Graduation audits and diploma issuances initiate following University Council approval of final academic records.')
                : isGradesView
                ? (isAr
                    ? 'تخضع معايير الدرجات لسلم النقاط المعتمد (4.00 / 5.00) وتُقفل فترات التعديل بانتهاء مواعيد الرصد المحددة.'
                    : 'Grade evaluation adheres to the institutional scale (4.00 / 5.00) with locked editing outside authorized periods.')
                : (isAr
                    ? 'تُعد التقارير الإحصائية ومؤشرات الأداء الأكاديمي دورياً وتُنشر وفق معايير الجودة المعتمدة.'
                    : 'Institutional reports and KPIs compile on a scheduled cycle conforming to quality standards.')}
            </p>
          </div>

          <div className="pt-4 border-t border-[#DCE3EB] flex items-center justify-between text-xs text-[#607086]">
            <span>{isAr ? 'السجل المؤسسي المعتمد' : 'Institutional Record'}</span>
            <span className="font-semibold text-[#607086]">{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
