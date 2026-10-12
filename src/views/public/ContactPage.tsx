import React, { useState } from 'react';
import { Mail, MessageSquare, Send, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';

interface ContactPageProps {
  locale: Locale;
}

export const ContactPage: React.FC<ContactPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Do not simulate fake success - truthfully notify user that backend dispatch is pending
    setStatusNotice(
      isAr
        ? 'تم استلام مدخلات النموذج محليًا. خدمة إرسال الاستفسارات بانتظار اكتمال ربط خادم الدعم والتذاكر (NestJS Backend).'
        : 'Form input captured locally. Inquiry dispatch is pending connection with the backend support service.'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#082B50]/10 text-[#082B50] text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6A53A]" />
          <span>{isAr ? 'قنوات التواصل' : 'Institutional Contact'}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#082B50] tracking-tight">
          {isAr ? 'التواصل والاستفسارات الأكاديمية' : 'Contact & Academic Inquiries'}
        </h1>
        <p className="text-xs md:text-sm text-[#607086]">
          {isAr
            ? 'نسعد باستقبال استفسارات الطلاب والراغبين بالالتحاق حول البرامج وشروط القبول'
            : 'Get in touch with NABA Academy academic advisory and admissions support'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Institutional Contact Overview (No invented phone or street address) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#082B50]/10 text-[#082B50] flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'الاستفسارات الأكاديمية' : 'Academic Admissions Inquiries'}
            </h3>
            <p className="text-xs text-[#607086] leading-relaxed">
              {isAr
                ? 'استفسارات شروط القبول، التخصصات، ومعادلة المقررات الدراسية.'
                : 'Direct inquiries regarding admission criteria, degrees, and course equivalencies.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE3EB] p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#174F89]/10 text-[#174F89] flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-[#102033]">
              {isAr ? 'الدعم الفني للمنصة' : 'Platform Technical Support'}
            </h3>
            <p className="text-xs text-[#607086] leading-relaxed">
              {isAr
                ? 'المساعدة التقنية للطلاب وأعضاء هيئة التدريس في تسجيل الدخول واستخدام المنظومة.'
                : 'Technical assistance for portal authentication, access, and e-learning tools.'}
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#DCE3EB] p-6 md:p-8 shadow-xs">
          <h3 className="text-base font-bold text-[#102033] mb-4">
            {isAr ? 'إرسال استفسار مباشر' : 'Send an Inquiry'}
          </h3>

          {statusNotice && (
            <div className="mb-6 p-4 rounded-xl bg-[#082B50]/5 border border-[#082B50]/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-[#082B50] shrink-0 mt-0.5" />
              <p className="text-xs text-[#082B50] leading-relaxed font-medium">
                {statusNotice}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102033] mb-1.5">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? 'أدخل اسمك الكريم' : 'Enter your name'}
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102033] mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102033] mb-1.5">
                {isAr ? 'موضوع الاستفسار' : 'Subject'}
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isAr ? 'عنوان الاستفسار' : 'Inquiry subject'}
                className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#102033] mb-1.5">
                {isAr ? 'نص الرسالة' : 'Message'}
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isAr ? 'اكتب تفاصيل استفسارك هنا...' : 'Provide details of your inquiry...'}
                className="w-full bg-[#F7F9FC] border border-[#DCE3EB] rounded-xl px-3.5 py-2 text-xs text-[#102033] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#082B50]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#082B50] hover:bg-[#061E38] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <Send size={14} />
                <span>{isAr ? 'إرسال الاستفسار' : 'Submit Inquiry'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
