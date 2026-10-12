import React from 'react';
import { useLocation } from 'react-router-dom';
import { HeartHandshake, LifeBuoy, AlertCircle, Mail, Headphones, Send } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface AlumniMentorshipPageProps {
  locale: Locale;
}

export const AlumniMentorshipPage: React.FC<AlumniMentorshipPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const location = useLocation();

  const isSupportView = location.pathname.includes('/alumni/support');

  const pageTitle = isSupportView
    ? (isAr ? 'الدعم والإرشاد المهني' : 'Career Advising & Support')
    : (isAr ? 'برنامج الإرشاد والتوجيه المهني' : 'Alumni Mentorship Initiative');

  const pageSubtitle = isSupportView
    ? (isAr
        ? 'التواصل مع وحدة علاقات الخريجين، الاستفسارات الأكاديمية، والمساندة التقنية'
        : 'Inquiries, career guidance requests, and technical assistance from Alumni Relations')
    : (isAr
        ? 'مشاركة الخبرات المهنية والتوجيه المعرفي مع طلبة وخريجي الأكاديمية'
        : 'Share career experience, vocational insights, and mentorship with students and graduates');

  const MainIcon = isSupportView ? LifeBuoy : HeartHandshake;

  return (
    <PortalPage
      title={pageTitle}
      subtitle={pageSubtitle}
      breadcrumbs={[
        { label: isAr ? 'بوابة الخريجين' : 'Alumni Portal', path: `/${locale}/alumni/dashboard` },
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
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Institutional Service Overview Card */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#DCE3EB]">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center shrink-0">
              <MainIcon size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#102033]">{pageTitle}</h3>
              <p className="text-xs text-[#607086] mt-0.5">{pageSubtitle}</p>
            </div>
          </div>

          <div className="py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
              <MainIcon size={26} />
            </div>
            <h4 className="text-sm font-bold text-[#102033] mb-1">
              {isSupportView
                ? (isAr ? 'لا توجد طلبات دعم أو تذاكر معلقة حالياً' : 'No Active Support Tickets on Record')
                : (isAr ? 'برنامج الإرشاد والتوجيه قيد الإعداد' : 'Mentorship Program Under Preparation')}
            </h4>
            <p className="text-xs text-[#607086] max-w-md mx-auto leading-relaxed">
              {isSupportView
                ? (isAr
                    ? 'ستتاح خدمة تقديم ومتابعة طلبات الدعم المهني والأكاديمي فور اكتمال الربط مع نظام خدمة المستفيدين المركزي.'
                    : 'Helpdesk ticketing and career support requests will be available once connected to the centralized backend.')
                : (isAr
                    ? 'يجري العمل على إطلاق منصة المواءمة المهنية للإرشاد وربط المرشدين بالطلبة بالتعاون مع وحدة التوجيه والإرشاد.'
                    : 'Mentorship pairing protocols and session bookings will activate upon integration with the university guidance department.')}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF3F8] text-[#607086] text-[11px] font-semibold border border-[#DCE3EB]">
              <AlertCircle size={14} className="text-[#607086]" />
              <span>{isAr ? 'في انتظار ربط الواجهة الخلفية' : 'Pending Backend Integration'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE3EB] flex items-center justify-between">
            <span className="text-xs text-[#607086]">
              {isAr ? 'وحدة شؤون الخريجين' : 'Alumni Relations Unit'}
            </span>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DCE3EB] text-[#607086] cursor-not-allowed rounded-lg text-xs font-bold transition-colors"
              title={isAr ? 'يتطلب ربط الواجهة الخلفية لتفعيل الطلبات' : 'Requires backend connection to submit requests'}
            >
              <Send size={13} />
              <span>{isSupportView ? (isAr ? 'تقديم طلب دعم جديد' : 'Submit Support Request') : (isAr ? 'التسجيل كمرشد' : 'Register as Mentor')}</span>
            </button>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
