import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorMessagesPageProps {
  locale: Locale;
}

export const InstructorMessagesPage: React.FC<InstructorMessagesPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Honest data-driven container: empty until real messages exist
  const messages: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'الرسائل والمحادثات الأكاديمية' : 'Faculty Messages & Inquiries'}
      subtitle={
        isAr
          ? 'التواصل الأكاديمي المباشر مع طلاب الشُعب وإدارة القسم والعمادة'
          : 'Direct academic communication with students, departmental chairs, and advising staff'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'الرسائل' : 'Messages' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
          title={isAr ? 'إرسال الرسائل متاح عند اتصال خدمة المحادثات' : 'Messaging available upon communication service connection'}
        >
          <Plus size={14} className="text-[#D6A53A]/60" />
          <span>{isAr ? 'رسالة جديدة' : 'New Message'}</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-[#607086]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث في الرسائل أو أسماء الطلاب...' : 'Search messages or student names...'}
              className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg ps-9 pe-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
            />
          </div>
        </div>

        {/* Messages Shell or Honest Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] shadow-xs overflow-hidden">
          {messages.length > 0 ? (
            <div className="divide-y divide-[#DCE3EB]" />
          ) : (
            <div className="py-16 px-4 text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <MessageSquare size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'صندوق الوارد فارغ — لا توجد رسائل حالياً' : 'Your inbox is empty — No messages currently.'}
              </h4>
              <p className="text-xs text-[#607086] leading-relaxed mb-4">
                {isAr
                  ? 'ستظهر هنا استفسارات الطلاب ورسائل إدارة القسم الأكاديمي فور إرسالها.'
                  : 'Inquiries from enrolled students and academic department notices will appear here once received.'}
              </p>
              <Link
                to={`/${locale}/instructor/dashboard`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#EFF3F8] border border-[#DCE3EB] text-[#082B50] rounded-lg text-xs font-bold transition-colors"
              >
                <span>{isAr ? 'العودة للوحة التحكم' : 'Return to Dashboard'}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
