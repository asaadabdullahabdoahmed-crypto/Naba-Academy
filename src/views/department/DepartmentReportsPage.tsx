import React from 'react';
import { useLocation } from 'react-router-dom';
import { Download, FileText, BarChart2, BellRing, FileCheck2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import type { DepartmentReport } from '../../types';

interface DepartmentReportsPageProps {
  locale: Locale;
}

export const DepartmentReportsPage: React.FC<DepartmentReportsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();
  const path = location.pathname;

  const isGrades = path.includes('/department/grades');
  const isAttendance = path.includes('/department/attendance');
  const isNotifications = path.includes('/department/notifications');

  // Domain reports from backend (empty state when not connected)
  const reports: DepartmentReport[] = [];

  let pageTitle = isAr ? 'التقارير المؤسسية وإحصاءات الأداء' : 'Institutional Performance Reports';
  let pageSubtitle = isAr
    ? 'تقارير نسب الإنجاز، توزيع الدرجات، ومؤشرات الأداء السنوية للقسم'
    : 'Comprehensive grade distributions, faculty workloads, and annual departmental analytics';
  let breadcrumbLabel = isAr ? 'التقارير' : 'Reports';
  let EmptyIcon = FileText;
  let emptyTitle = isAr ? 'لا تتوفر تقارير منشورة حالياً' : 'No published reports currently available';
  let emptyDesc = isAr
    ? 'يتم إصدار التقارير الإحصائية المعتمدة بنهاية الفصول الدراسية بعد إغلاق النتائج وتدقيق لجان القياس والتقويم.'
    : 'Statistical and performance reports are published at the close of academic semesters following committee reconciliations.';

  if (isGrades) {
    pageTitle = isAr ? 'اعتماد الدرجات والنتائج النهائية' : 'Final Grade Approvals & Results';
    pageSubtitle = isAr
      ? 'مراجعة واعتماد كشوف درجات مقررات القسم قبل إرسالها لعمادة القبول والتسجيل'
      : 'Review and certify course grade sheets prior to official transmission to the University Registrar';
    breadcrumbLabel = isAr ? 'اعتماد الدرجات' : 'Grade Approvals';
    EmptyIcon = FileCheck2;
    emptyTitle = isAr ? 'لا توجد كشوف درجات معلقة للاعتماد حالياً' : 'No grade rosters pending certification';
    emptyDesc = isAr
      ? 'ستظهر هنا كشوف درجات المقررات المحالة من أساتذة المواد بعد انتهاء فترات الاختبارات ورصد الدرجات.'
      : 'Course grade rosters forwarded by faculty instructors will appear here following examination grading periods.';
  } else if (isAttendance) {
    pageTitle = isAr ? 'متابعة الحرمان والغياب الأكاديمي' : 'Attendance Tracking & Denial Sanctions';
    pageSubtitle = isAr
      ? 'تدقيق نسب الغياب وتأكيد قرارات الحرمان من دخول الاختبارات النهائية'
      : 'Audit attendance thresholds and confirm examination denial notices for excessive absences';
    breadcrumbLabel = isAr ? 'الحرمان والغياب' : 'Attendance & Denials';
    EmptyIcon = AlertTriangle;
    emptyTitle = isAr ? 'لا توجد قوائم حرمان أو تجاوز نسب غياب مسجلة' : 'No absence denial records on file';
    emptyDesc = isAr
      ? 'يتم احتساب نسب الغياب آلياً عبر نظام الحضور الإلكتروني وإشعار الطلاب وأولياء الأمور بالإنذارات النظامية.'
      : 'Absence percentages are computed automatically via the attendance engine, with regulatory warnings sent to students.';
  } else if (isNotifications) {
    pageTitle = isAr ? 'التعاميم والقرارات الإدارية للقسم' : 'Department Circulars & Official Notices';
    pageSubtitle = isAr
      ? 'القرارات الصادرة من مجلس القسم والتعاميم الأكاديمية الواردة من عمادة الكلية'
      : 'Decisions issued by the Department Council and academic circulars from the College Deanship';
    breadcrumbLabel = isAr ? 'التعاميم والقرارات' : 'Notifications & Circulars';
    EmptyIcon = BellRing;
    emptyTitle = isAr ? 'لا توجد تعاميم أو قرارات جديدة' : 'No circulars or administrative notices';
    emptyDesc = isAr
      ? 'تُنشر التعاميم الأكاديمية والقرارات الرسمية المعتمدة الصادرة عن إدارة الجامعة ومجلس القسم هنا.'
      : 'Official academic circulars and approved administrative resolutions are published here.';
  }

  return (
    <PortalPage
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumbs={[
        { label: isAr ? 'بوابة رئيس القسم' : 'Department Portal', path: `/${locale}/department/dashboard` },
        { label: breadcrumbLabel },
      ]}
      locale={locale}
    >
      <div className="space-y-6">
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-14 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
              <EmptyIcon size={24} />
            </div>
            <h3 className="text-sm font-bold text-[#102033] mb-1">
              {emptyTitle}
            </h3>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {emptyDesc}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EFF3F8] text-[11px] text-[#607086] border border-[#DCE3EB]">
              <ShieldCheck size={13} className="text-[#D6A53A]" />
              <span>{isAr ? 'حوكمة أكاديمية موثقة' : 'Verified Academic Governance'}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#102033]">{r.title}</h4>
                    <p className="text-xs text-[#607086] mt-0.5">{r.date} • {r.size}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
                >
                  <Download size={13} />
                  <span>PDF</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalPage>
  );
};
