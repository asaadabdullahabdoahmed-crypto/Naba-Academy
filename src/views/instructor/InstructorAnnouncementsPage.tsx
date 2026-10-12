import React, { useState } from 'react';
import { Bell, Plus, Send, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorAnnouncementsPageProps {
  locale: Locale;
}

export const InstructorAnnouncementsPage: React.FC<InstructorAnnouncementsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetSection, setTargetSection] = useState('ALL');

  // Honest data-driven container: empty until real announcements are fetched
  const announcements: any[] = [];

  return (
    <PortalPage
      title={isAr ? 'الإعلانات والتعاميم الأكاديمية' : 'Course Announcements'}
      subtitle={
        isAr
          ? 'نشر التنبيهات العاجلة والمستجدات الدراسية للطلاب في الشُعب المكلفة'
          : 'Broadcast urgent updates, academic notices, and scheduling changes to students'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة المحاضر' : 'Faculty Portal', path: `/${locale}/instructor/dashboard` },
        { label: isAr ? 'الإعلانات الأكاديمية' : 'Announcements' },
      ]}
      locale={locale}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Form Shell (1 column) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#DCE3EB]">
            <h3 className="text-sm font-bold text-[#082B50]">
              {isAr ? 'إنشاء إعلان جديد' : 'New Announcement'}
            </h3>
            <p className="text-xs text-[#607086] mt-0.5">
              {isAr ? 'سيصل الإعلان فوراً لجميع الطلاب في الشعب المحددة' : 'Broadcasts to enrolled students in target sections'}
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#102033] mb-1">
                {isAr ? 'الشعبة المستهدفة' : 'Target Section'}
              </label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
              >
                <option value="ALL">{isAr ? 'كافة الشُعب والمقررات' : 'All Sections'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102033] mb-1">
                {isAr ? 'عنوان الإعلان' : 'Announcement Title'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? 'أدخل عنواناً واضحاً وموجزاً...' : 'Enter clear subject...'}
                className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102033] mb-1">
                {isAr ? 'نص الإعلان' : 'Message Body'}
              </label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isAr ? 'اكتب تفاصيل التنبيه الأكاديمي هنا...' : 'Write announcement body here...'}
                className="w-full bg-[#EFF3F8] border border-[#DCE3EB] rounded-lg px-3 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#082B50]/40 text-white/50 rounded-lg text-xs font-semibold cursor-not-allowed border border-[#DCE3EB]"
              title={isAr ? 'نشر الإعلانات متاح عند اتصال خدمة الإشعارات' : 'Publishing available upon notification service connection'}
            >
              <Send size={14} className="text-[#D6A53A]/60" />
              <span>{isAr ? 'نشر الإعلان للطلاب' : 'Publish Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Announcements List Shell (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#082B50]">
              {isAr ? 'سجل الإعلانات السابقة والمنشورة' : 'Published Announcements History'}
            </h4>
          </div>

          {announcements.length > 0 ? (
            <div className="space-y-3">
              {/* Populated when real announcements exist */}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#DCE3EB] p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-3 border border-[#DCE3EB]">
                <Bell size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#102033] mb-1">
                {isAr ? 'لا توجد إعلانات منشورة حالياً' : 'No announcements published yet.'}
              </h4>
              <p className="text-xs text-[#607086] max-w-sm mx-auto leading-relaxed">
                {isAr
                  ? 'ستظهر هنا كافة الإعلانات والتعاميم الصادرة للطلاب في الشعب المكلفة.'
                  : 'Announcements published to your assigned course sections will appear here.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </PortalPage>
  );
};
