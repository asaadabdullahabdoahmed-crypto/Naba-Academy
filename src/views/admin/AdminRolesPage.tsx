import React from 'react';
import { ShieldCheck, Key, Check, Lock, Shield, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminRolesPageProps {
  locale: Locale;
}

export const AdminRolesPage: React.FC<AdminRolesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();

  // Architecture RBAC definitions
  const roles = [
    {
      name: 'ADMIN',
      titleAr: 'مسؤول النظام',
      titleEn: 'Administrator',
      descAr: 'إدارة المستخدمين، إعدادات المنظومة، وسياسات الوصول والصلاحيات',
      descEn: 'Platform administration, user management, and security access policies',
      permsAr: [
        'إدارة الحسابات وتعيين الأدوار والصلاحيات',
        'ضبط سياسات النظام وإعدادات المنصة',
        'مراجعة سجلات التدقيق والعمليات الإدارية',
        'إدارة فترات القبول والتسجيل والتقويم الأكاديمي',
      ],
      permsEn: [
        'User account and RBAC role assignment management',
        'Platform settings and security policy control',
        'Administrative audit log and operations review',
        'Academic admissions, registration, and calendar scheduling',
      ],
    },
    {
      name: 'DEPARTMENT_HEAD',
      titleAr: 'رئيس القسم الأكاديمي',
      titleEn: 'Department Chair',
      descAr: 'إدارة البرامج والخطط الدراسية، تكليفات التدريس، واعتماد الدرجات',
      descEn: 'Academic program oversight, faculty teaching load allocation, and grade approval',
      permsAr: [
        'إدارة البرامج والمقررات والخطط الدراسية',
        'إسناد المقررات والشُعب لأعضاء هيئة التدريس',
        'البت في طلبات التسجيل والحذف والاستثناءات',
        'مراجعة واعتماد كشوف الدرجات النهائية',
      ],
      permsEn: [
        'Program, course, and study plan administration',
        'Faculty teaching assignment & section allocation',
        'Registration petitions & prerequisite waiver decisions',
        'Final grade roster review and departmental approval',
      ],
    },
    {
      name: 'INSTRUCTOR',
      titleAr: 'عضو هيئة التدريس',
      titleEn: 'Faculty Instructor',
      descAr: 'إدارة المحتوى التعليمي، الفصول الافتراضية، التقييم ورصد الدرجات',
      descEn: 'Course content management, virtual lecture delivery, assessment, and grading',
      permsAr: [
        'بناء المحتوى الدراسي والمحاضرات المرئية',
        'إنشاء بنوك الأسئلة والاختبارات الدورية',
        'رصد درجات الأعمال الفصلية والاختبارات',
        'إدارة جلسات البث الحي والمكاتب الافتراضية',
      ],
      permsEn: [
        'Course syllabus & multimedia lecture development',
        'Question bank creation & scheduled assessments',
        'Continuous coursework and final examination grading',
        'Live classroom broadcasting & virtual office hours',
      ],
    },
    {
      name: 'STUDENT',
      titleAr: 'طالب أكاديمي',
      titleEn: 'Enrolled Student',
      descAr: 'التسجيل في المقررات، حضور المحاضرات، تسليم الواجبات، ومتابعة السجل',
      descEn: 'Course enrollment, lecture attendance, assignment submissions, and academic record tracking',
      permsAr: [
        'التسجيل في الشعب الدراسية المتاحة',
        'حضور المحاضرات ومشاهدة التسجيلات السحابية',
        'تسليم التكليفات وأداء الاختبارات الإلكترونية',
        'الاطلاع على السجل الأكاديمي والمعدل التراكمي',
      ],
      permsEn: [
        'Self-service course and section enrollment',
        'Lecture participation & cloud replay access',
        'Assignment submission & proctored exam taking',
        'Academic transcript & cumulative GPA review',
      ],
    },
    {
      name: 'ALUMNI',
      titleAr: 'خريج معتمد',
      titleEn: 'Certified Alumni',
      descAr: 'طلب الوثائق الرسمية، التحقق الرقمي، وشبكة الخريجين المهنية',
      descEn: 'Official credential requests, digital certificate verification, and career network',
      permsAr: [
        'الوصول إلى السجل الأكاديمي الرقمي الموثق',
        'التحقق من الشهادة الجدارية عبر رمز الاستجابة السريعة',
        'طلب الإفادات والوثائق الأكاديمية الرسمية',
        'التسجيل في ملتقيات الخريجين وفرص التوظيف',
      ],
      permsEn: [
        'Access to verified digital transcript',
        'QR-code degree diploma verification',
        'Official graduation verification request issuance',
        'Alumni networking & career opportunity access',
      ],
    },
  ];

  return (
    <PortalPage
      title={isAr ? 'الأدوار وصلاحيات الوصول (RBAC)' : 'Role-Based Access Control (RBAC)'}
      subtitle={
        isAr
          ? 'حوكمة مصفوفة الصلاحيات، مستويات الوصول، ومسؤوليات المنظومة'
          : 'Define permission matrices, access tiers, and institutional responsibilities'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'الأدوار والصلاحيات' : 'Roles & Permissions' },
      ]}
      locale={locale}
      actions={
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-xs font-semibold border border-[#DCE3EB]">
          <AlertCircle size={14} className="text-[#607086]" />
          <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((r, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#DCE3EB]">
                <span className="font-mono text-xs font-bold text-[#082B50] bg-[#EFF3F8] px-2.5 py-1 rounded-lg border border-[#DCE3EB]">
                  {r.name}
                </span>
                <span className="text-[11px] text-[#607086] font-medium">
                  {isAr ? 'دور نظامي' : 'System Role'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? r.titleAr : r.titleEn}
              </h3>
              <p className="text-xs text-[#607086] mb-4 leading-relaxed">
                {isAr ? r.descAr : r.descEn}
              </p>

              <div className="space-y-2 border-t border-[#DCE3EB] pt-3">
                <span className="text-[11px] font-bold text-[#082B50] block">
                  {isAr ? 'الصلاحيات المعتمدة:' : 'Authorized Permissions:'}
                </span>
                {(isAr ? r.permsAr : r.permsEn).map((perm, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2 text-xs text-[#607086]">
                    <Check size={14} className="text-[#082B50] shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#DCE3EB] flex items-center justify-between text-[11px] text-[#607086]">
              <span>{isAr ? 'قواعد RBAC' : 'RBAC Rules'}</span>
              <span className="font-semibold text-[#082B50]">{isAr ? 'مهيأ' : 'Configured'}</span>
            </div>
          </div>
        ))}
      </div>
    </PortalPage>
  );
};
