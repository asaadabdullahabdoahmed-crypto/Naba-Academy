import React from 'react';
import { Link } from 'react-router-dom';
import {
  MicOff,
  VideoOff,
  Monitor,
  Disc,
  Users,
  MessageSquare,
  Radio,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Clock,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { Locale, useTranslation } from '../../i18n/dictionaries';

interface InstructorLiveSessionPageProps {
  locale: Locale;
}

export const InstructorLiveSessionPage: React.FC<InstructorLiveSessionPageProps> = ({ locale }) => {
  const { isAr } = useTranslation();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#061E38] text-white flex flex-col font-sans select-none">
      {/* Studio Header Bar */}
      <header className="h-16 bg-[#082B50] border-b border-[#174F89]/50 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to={`/${locale}/instructor/dashboard`}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={isAr ? 'العودة إلى لوحة التحكم' : 'Return to Dashboard'}
          >
            <ArrowIcon size={18} />
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DCE3EB]/40" />
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {isAr ? 'قاعة البث التفاعلي والمحاضرات المباشرة' : 'Interactive Live Studio'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-white/70 border border-white/10">
            <Radio size={12} className="text-[#D6A53A]" />
            {isAr ? 'قيد الانتظار' : 'Standby Mode'}
          </span>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Stream Viewport Shell */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#061E38] gap-4">
          <div className="flex-1 relative rounded-2xl bg-[#082B50] border border-[#174F89]/40 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
            <div className="w-20 h-20 rounded-2xl bg-[#174F89]/20 border border-[#174F89]/40 flex items-center justify-center mb-4 text-[#D6A53A]">
              <Radio size={40} />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white mb-2">
              {isAr ? 'لا توجد جلسة بث مباشر قيد التشغيل حالياً' : 'No Active Live Broadcast Running'}
            </h2>
            <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto leading-relaxed mb-6">
              {isAr
                ? 'قاعة البث مهيأة للاجتماعات الافتراضية والمحاضرات المتزامنة. تبدأ الجلسات تلقائياً حسب جدول المحاضرات المعتمد.'
                : 'The studio shell is configured for synchronous lectures and virtual sessions. Broadcasts activate when a scheduled lecture commences.'}
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70">
              <Calendar size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'الجدول الأكاديمي: لا توجد محاضرات مجدولة في هذا الوقت' : 'Academic Schedule: No lectures scheduled at this hour'}</span>
            </div>
          </div>

          {/* Neutral Inactive Control Toolbar */}
          <div className="h-16 bg-[#082B50] rounded-2xl border border-[#174F89]/40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="p-2.5 rounded-xl bg-white/5 text-white/40 cursor-not-allowed border border-white/5"
                title={isAr ? 'الميكروفون غير متصل' : 'Microphone inactive'}
              >
                <MicOff size={16} />
              </div>
              <div
                className="p-2.5 rounded-xl bg-white/5 text-white/40 cursor-not-allowed border border-white/5"
                title={isAr ? 'الكاميرا غير متصلة' : 'Camera inactive'}
              >
                <VideoOff size={16} />
              </div>
              <div
                className="p-2.5 rounded-xl bg-white/5 text-white/40 cursor-not-allowed border border-white/5"
                title={isAr ? 'مشاركة الشاشة غير متاحة خارج الجلسة' : 'Screen share inactive'}
              >
                <Monitor size={16} />
              </div>
              <div
                className="p-2.5 rounded-xl bg-white/5 text-white/40 cursor-not-allowed border border-white/5 hidden sm:flex items-center"
                title={isAr ? 'التسجيل السحابي غير متاح' : 'Recording inactive'}
              >
                <Disc size={16} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/${locale}/instructor/dashboard`}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
              >
                {isAr ? 'مغادرة القاعة' : 'Exit Studio'}
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Shell: Participants & Chat */}
        <div className="w-full lg:w-80 bg-[#082B50] border-t lg:border-t-0 lg:border-s border-[#174F89]/40 flex flex-col h-72 lg:h-auto">
          {/* Tabs */}
          <div className="flex border-b border-[#174F89]/40">
            <div className="flex-1 py-3 text-xs font-bold text-center border-b-2 border-[#D6A53A] text-white flex items-center justify-center gap-2">
              <Users size={14} className="text-[#D6A53A]" />
              <span>{isAr ? 'قائمة الحضور (0)' : 'Participants (0)'}</span>
            </div>
            <div className="flex-1 py-3 text-xs font-bold text-center text-white/50 flex items-center justify-center gap-2">
              <MessageSquare size={14} />
              <span>{isAr ? 'المحادثة' : 'Chat'}</span>
            </div>
          </div>

          {/* Tab Content: Honest Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-white/40">
              <Users size={20} />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">
              {isAr ? 'لا يوجد متصلون' : 'No Participants Connected'}
            </h3>
            <p className="text-[11px] text-white/50 max-w-xs leading-relaxed">
              {isAr
                ? 'تظهر قائمة الطلاب والمسجلين تلقائياً عند انضمامهم إلى جلسة المحاضرة المباشرة.'
                : 'Enrolled students appear here once connected to an active lecture session.'}
            </p>
          </div>

          {/* Footer Notice */}
          <div className="p-3 border-t border-[#174F89]/40 bg-[#061E38]/40 text-[11px] text-white/40 flex items-center gap-2 justify-center">
            <Shield size={12} className="text-[#D6A53A]" />
            <span>{isAr ? 'بيئة بث أكاديمية مشفرة' : 'Encrypted Academic Stream'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
