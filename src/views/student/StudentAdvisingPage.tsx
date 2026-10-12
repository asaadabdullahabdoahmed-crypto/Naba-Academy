import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MessageSquare, Send, CheckCircle2, ShieldCheck, BookOpen, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentAdvisingPageProps {
  locale: Locale;
}

export const StudentAdvisingPage: React.FC<StudentAdvisingPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [messageText, setMessageText] = useState('');
  const [inquiryType, setInquiryType] = useState('plan');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    toast.info(
      isAr
        ? 'خدمة إرسال الاستشارات الأكاديمية تتطلب ربط نظام الإرشاد الطلابي'
        : 'Advising inquiry dispatch requires connection to the student advising service'
    );
    setMessageText('');
  };

  return (
    <PortalPage
      title={isAr ? 'الإرشاد والتوجيه الأكاديمي' : 'Academic Advising & Guidance'}
      subtitle={
        isAr
          ? 'التواصل الأكاديمي مع المرشد، التخطيط للمقررات، ومتابعة المسار التعليمي'
          : 'Direct academic guidance, degree planning, and study progression'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'الإرشاد الأكاديمي' : 'Advising' },
      ]}
      locale={locale}
      actions={
        <Link
          to={`/${locale}/student/registration`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          <BookOpen size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'التسجيل الفصلي' : 'Registration'}</span>
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Advising Office Shell (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center font-bold text-sm border border-[#DCE3EB]">
                <Users size={22} className="text-[#082B50]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#102033]">
                  {isAr ? 'وحدة الإرشاد الأكاديمي' : 'Academic Advising Unit'}
                </h3>
                <p className="text-xs text-[#607086]">
                  {isAr ? 'أكاديمية نبا' : 'NABA Academy'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCE3EB] space-y-2.5 text-xs text-[#607086]">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#082B50]" />
                <span>{isAr ? 'التواصل عبر البوابة الأكاديمية' : 'Online Academic Inquiries'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#082B50]" />
                <span>{isAr ? 'استشارات أكاديمية موجهة' : 'Academic Consultations'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#DCE3EB] text-[11px] text-[#607086] leading-relaxed">
              {isAr
                ? 'يهدف الإرشاد الأكاديمي إلى مساعدة الطالب في اختيار المقررات، التغلب على الصعوبات الدراسية، والتخطيط للتخرج.'
                : 'Academic advising assists students in course selection, academic difficulty resolution, and graduation planning.'}
            </div>
          </div>
        </div>

        {/* Advisory Inquiry & Consultation Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 md:p-8 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#102033]">
                {isAr ? 'إرسال استشارة أو استفسار أكاديمي' : 'Submit Academic Consultation Inquiry'}
              </h3>
              <p className="text-xs text-[#607086] mt-0.5">
                {isAr
                  ? 'سيتم توجيه طلبك إلى المرشد الأكاديمي المختص وموافقتك بالرد الرسمي'
                  : 'Your inquiry will be routed to your designated academic advisor with formal feedback'}
              </p>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'نوع الاستشارة الأكاديمية' : 'Consultation Category'}
                </label>
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] cursor-pointer"
                >
                  <option value="plan">{isAr ? 'تخطيط الخطة الدراسية والمقررات' : 'Degree Planning & Course Selection'}</option>
                  <option value="load">{isAr ? 'العبء الدراسي والتعثر الأكاديمي' : 'Credit Load & Academic Progress'}</option>
                  <option value="general">{isAr ? 'استشارة عامة في التعليم الإلكتروني' : 'General Distance Learning Inquiry'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'تفاصيل الاستفسار أو المشورة المطلوبة' : 'Inquiry Details & Questions'}
                </label>
                <textarea
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اكتب استفسارك الأكاديمي بالتفصيل هنا...'
                      : 'Provide details regarding your academic question or proposed study schedule...'
                  }
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl p-3.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Send size={14} className="text-[#D6A53A]" />
                  <span>{isAr ? 'إرسال الاستشارة' : 'Submit Consultation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
