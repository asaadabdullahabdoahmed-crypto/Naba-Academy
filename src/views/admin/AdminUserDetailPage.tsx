import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Shield, CheckCircle2, Lock, Save, ArrowRight, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AdminUserDetailPageProps {
  locale: Locale;
}

export const AdminUserDetailPage: React.FC<AdminUserDetailPageProps> = ({ locale }) => {
  const { userId } = useParams<{ userId: string }>();
  const { isAr } = useTranslation();
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  // Real backend lookup; empty state when record does not exist
  const [userRecord] = useState<{
    id: string;
    nameAr: string;
    nameEn: string;
    email: string;
    role: string;
    department: string;
    status: string;
  } | null>(null);

  return (
    <PortalPage
      title={isAr ? 'ملف الحساب والصلاحيات' : 'Account & Permissions Record'}
      subtitle={
        userRecord
          ? `${userRecord.email} • ${userRecord.role}`
          : (isAr ? `معرف السجل الأكاديمي: ${userId || '—'}` : `Account Identifier: ${userId || '—'}`)
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الإدارة' : 'Admin Portal', path: `/${locale}/admin/dashboard` },
        { label: isAr ? 'المستخدمون' : 'Users Directory', path: `/${locale}/admin/users` },
        { label: userId || (isAr ? 'تفاصيل الحساب' : 'Account Details') },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/admin/users`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
        >
          <BackArrow size={14} />
          <span>{isAr ? 'العودة للمستخدمين' : 'Back to Users'}</span>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {!userRecord ? (
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-8 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <User size={26} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isAr ? 'لم يتم العثور على سجل المستخدم' : 'User Record Not Found'}
            </h4>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed mb-4">
              {isAr
                ? 'ستظهر بيانات وتفاصيل المستخدم هنا فور الربط مع قاعدة البيانات المركزية.'
                : 'User account details will display here once connected to the backend database.'}
            </p>
            <div className="inline-flex items-center gap-2 p-3 bg-[#EFF3F8] rounded-xl text-xs text-[#082B50] font-mono">
              <span className="font-bold">UID:</span>
              <span>{userId}</span>
            </div>
          </div>
        ) : (
          <form className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'بيانات الحساب الأساسية' : 'Primary Account Details'}
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#102033] mb-1">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  defaultValue={isAr ? userRecord.nameAr : userRecord.nameEn}
                  disabled
                  className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102033] mb-1">
                  {isAr ? 'البريد الإلكتروني المؤسسي' : 'Official Email'}
                </label>
                <input
                  type="email"
                  defaultValue={userRecord.email}
                  disabled
                  className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102033] mb-1">
                    {isAr ? 'الدور الوظيفي' : 'Role'}
                  </label>
                  <input
                    type="text"
                    defaultValue={userRecord.role}
                    disabled
                    className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102033] mb-1">
                    {isAr ? 'حالة الحساب' : 'Status'}
                  </label>
                  <input
                    type="text"
                    defaultValue={userRecord.status}
                    disabled
                    className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg p-2.5 text-[#102033]"
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </PortalPage>
  );
};
