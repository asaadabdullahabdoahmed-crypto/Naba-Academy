import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, FilePlus, Send, ShieldCheck, LifeBuoy } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentAppealsPageProps {
  locale: Locale;
}

export const StudentAppealsPage: React.FC<StudentAppealsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();

  const [appealType, setAppealType] = useState('GRADE');
  const [courseCode, setCourseCode] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    toast.info(
      isAr
        ? 'تقديم التظلمات والطلبات الأكاديمية يتطلب ربط نظام شؤون الطلاب واللجان'
        : 'Academic appeal submission requires connection to student affairs backend service'
    );
  };

  return (
    <PortalPage
      title={isAr ? 'التظلمات الأكاديمية والدعم الطلابي' : 'Academic Appeals & Student Support'}
      subtitle={
        isAr
          ? 'تقديم طلبات مراجعة الدرجات، الأعذار المقبولة، والاستفسارات الأكاديمية'
          : 'Submit grade review requests, attendance excuses, and academic inquiries'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'التظلمات والدعم' : 'Appeals & Support' },
      ]}
      locale={locale}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appeal Submission Form (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DCE3EB] p-6 md:p-8 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'تقديم تظلم أو طلب دعم جديد' : 'Submit New Appeal or Support Ticket'}
            </h3>
            <p className="text-xs text-[#607086] mt-0.5">
              {isAr
                ? 'تُراجع جميع الطلبات من قبل اللجنة الأكاديمية المختصة في الشؤون الطلابية'
                : 'All requests are evaluated independently by the Academic Appeals Committee'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'نوع الطلب' : 'Request Category'}
                </label>
                <select
                  value={appealType}
                  onChange={(e) => setAppealType(e.target.value)}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50] cursor-pointer"
                >
                  <option value="GRADE">{isAr ? 'إعادة مراجعة رصد درجة' : 'Grade Verification / Re-check'}</option>
                  <option value="ABSENCE">{isAr ? 'عذر غياب عن محاضرة أو اختبار' : 'Absence or Exam Excuse'}</option>
                  <option value="EXAM_CONFLICT">{isAr ? 'تعارض مواعيد الاختبارات' : 'Exam Schedule Conflict'}</option>
                  <option value="GENERAL_SUPPORT">{isAr ? 'دعم فني أو أكاديمي عام' : 'General Academic Support'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1.5">
                  {isAr ? 'رمز المقرر (اختياري)' : 'Course Code (Optional)'}
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder={isAr ? 'مثال: CS 101' : 'e.g. CS 101'}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102033] mb-1.5">
                {isAr ? 'بيان أسباب الطلب ومبرراته' : 'Detailed Justification & Background'}
              </label>
              <textarea
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  isAr
                    ? 'وضح بالتفصيل حيثيات طلبك والمستندات الداعمة له...'
                    : 'Provide comprehensive explanation and supporting circumstances...'
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
                <span>{isAr ? 'إرسال الطلب' : 'Submit Request'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Regulations & Past Status (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#082B50]" />
              <h3 className="text-xs font-bold text-[#102033]">
                {isAr ? 'ضوابط التظلمات الأكاديمية' : 'Appeals Regulations'}
              </h3>
            </div>
            <p className="text-[11px] text-[#607086] leading-relaxed">
              {isAr
                ? 'يتم تقديم طلبات التظلم والاستفسارات الأكاديمية وفق الضوابط واللوائح الأكاديمية، ويتم إشعار الطالب بقرار اللجنة عبر المنصة.'
                : 'Academic appeals and inquiries are processed in accordance with academic regulations.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#102033]">
              {isAr ? 'الطلبات السابقة' : 'Past Requests'}
            </h3>
            <div className="text-center py-6 text-xs text-[#607086]">
              <LifeBuoy size={24} className="mx-auto mb-2 text-[#082B50]" />
              <p>{isAr ? 'لا توجد طلبات تظلم سابقة' : 'No prior appeals found'}</p>
            </div>
          </div>
        </div>
      </div>
    </PortalPage>
  );
};
