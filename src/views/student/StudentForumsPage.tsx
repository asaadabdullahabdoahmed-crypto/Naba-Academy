import React, { useState } from 'react';
import { MessageSquare, PlusCircle, MessageCircle, ShieldCheck, Search, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { PortalPage } from '../../components/scaffold/PortalPage';
import { Locale, useTranslation } from '../../i18n/dictionaries';
import { useToast } from '../../components/ui/toast';

interface StudentForumsPageProps {
  locale: Locale;
}

export const StudentForumsPage: React.FC<StudentForumsPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const { toast } = useToast();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<'forums' | 'messages'>('forums');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    toast.info(
      isAr
        ? 'إنشاء مواضيع النقاش الأكاديمي يتطلب ربط خادم المنتديات وقاعدة البيانات'
        : 'Posting forum topics requires connection to the academic discussion service'
    );
    setNewTitle('');
    setNewContent('');
  };

  return (
    <PortalPage
      title={isAr ? 'المنتديات الأكاديمية والرسائل' : 'Academic Forums & Messaging'}
      subtitle={
        isAr
          ? 'حلقات النقاش التفاعلية مع الأساتذة والزملاء، والتواصل الأكاديمي'
          : 'Interactive academic discussion boards, instructor Q&A, and direct messaging'
      }
      breadcrumbs={[
        { label: isAr ? 'بوابة الطالب' : 'Student Portal', path: `/${locale}/student/dashboard` },
        { label: isAr ? 'المنتديات والرسائل' : 'Forums & Messages' },
      ]}
      locale={locale}
      actions={
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#082B50] hover:bg-[#061E38] text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <PlusCircle size={14} className="text-[#D6A53A]" />
          <span>{isAr ? 'طرح موضوع نقاش جديد' : 'New Discussion Topic'}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-3 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('forums')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'forums'
                  ? 'bg-[#082B50] text-[#D6A53A] shadow-xs'
                  : 'text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'منتديات المقررات الدراسية' : 'Course Forums'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-[#082B50] text-[#D6A53A] shadow-xs'
                  : 'text-[#607086] hover:text-[#102033]'
              }`}
            >
              {isAr ? 'الرسائل والمحادثات المباشرة' : 'Direct Messages'}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-[#607086]">
            <ShieldCheck size={14} className="text-[#082B50]" />
            <span>{isAr ? 'بيئة تفاعلية أكاديمية منضبطة' : 'Proctored Academic Environment'}</span>
          </div>
        </div>

        {/* Factual Academic Empty State */}
        <div className="bg-white rounded-2xl border border-[#DCE3EB] p-10 md:p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EFF3F8] text-[#082B50] flex items-center justify-center mx-auto mb-4 border border-[#DCE3EB]">
            <MessageSquare size={28} className="text-[#082B50]" />
          </div>

          <h3 className="text-base md:text-lg font-bold text-[#102033] mb-2">
            {activeTab === 'forums'
              ? (isAr ? 'لا توجد موضوعات نقاش نشطة حالياً' : 'No active discussion threads currently')
              : (isAr ? 'صندوق الرسائل والمحادثات فارغ' : 'Your message inbox is currently empty')}
          </h3>

          <p className="text-xs text-[#607086] max-w-lg mx-auto mb-6 leading-relaxed">
            {isAr
              ? 'يمكنك بدء حلقة نقاش أكاديمية مع أستاذ المقرر وزملائك الطلاب لطرح التساؤلات والمشاركة العلمية.'
              : 'You can start a new academic thread to discuss course concepts with instructors and classmates.'}
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'إنشاء موضوع نقاش' : 'Create Discussion'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Topic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#DCE3EB] shadow-2xl">
            <h3 className="text-base font-bold text-[#102033]">
              {isAr ? 'طرح موضوع نقاش أكاديمي' : 'Create Academic Topic'}
            </h3>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'عنوان الموضوع' : 'Topic Subject'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isAr ? 'اكتب عنواناً واضحاً وموجزاً...' : 'Enter clear, descriptive subject...'}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102033] mb-1">
                  {isAr ? 'نص المشاركة والتساؤل' : 'Message Content'}
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={isAr ? 'اكتب تفاصيل استفسارك أو مشاركتك العلمية...' : 'Write message content...'}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl p-3.5 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#DCE3EB] text-[#102033] text-xs font-bold hover:bg-[#F7F9FC] transition-colors cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#082B50] hover:bg-[#061E38] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isAr ? 'نشر الموضوع' : 'Publish Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalPage>
  );
};
