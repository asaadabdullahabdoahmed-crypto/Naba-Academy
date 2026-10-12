import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, HelpCircle, FileText, Shield } from 'lucide-react';
import { Locale } from '../../i18n/dictionaries';
import { useTranslation } from '../../i18n/useTranslation';
import { NabaLogo } from '../common/NabaLogo';

interface PublicFooterProps {
  locale: Locale;
  onOpenRouteVerifier?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ locale }) => {
  const { d, isAr } = useTranslation();

  return (
    <footer className="bg-[#061E38] text-white pt-14 pb-10 border-t border-[#082B50]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Col 1: About Academy with Official Logo */}
          <div className="space-y-4">
            <Link to={`/${locale}`} className="inline-block">
              <NabaLogo size="md" variant="light" showText={true} />
            </Link>
            <p className="text-xs text-white/70 leading-relaxed pt-1">
              {isAr
                ? 'أكاديمية نبا للتعليم الإلكتروني والتعليم عن بعد - منصة تعليمية جامعية متكاملة لإدارة المحتوى والأنشطة الأكاديمية.'
                : 'NABA Academy for Digital Higher Education - An integrated academic distance-learning platform.'}
            </p>
          </div>

          {/* Col 2: Academic Portals */}
          <div>
            <h4 className="text-xs font-bold text-[#D6A53A] uppercase tracking-wider mb-4">
              {isAr ? 'البوابات الأكاديمية' : 'Academic Portals'}
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <Link to={`/${locale}/student/dashboard`} className="hover:text-white hover:underline transition-colors">
                  {d.portals.student}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/instructor/dashboard`} className="hover:text-white hover:underline transition-colors">
                  {d.portals.instructor}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/department/dashboard`} className="hover:text-white hover:underline transition-colors">
                  {d.portals.department}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/admin/dashboard`} className="hover:text-white hover:underline transition-colors">
                  {d.portals.admin}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/alumni/dashboard`} className="hover:text-white hover:underline transition-colors">
                  {d.portals.alumni}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Services */}
          <div>
            <h4 className="text-xs font-bold text-[#D6A53A] uppercase tracking-wider mb-4">
              {isAr ? 'الخدمات الأكاديمية' : 'Academic Services'}
            </h4>
            <ul className="space-y-2.5 text-xs text-white/75">
              <li>
                <Link to={`/${locale}/programs`} className="hover:text-white hover:underline transition-colors">
                  {isAr ? 'دليل البرامج الأكاديمية' : 'Programs Directory'}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/faculty`} className="hover:text-white hover:underline transition-colors">
                  {isAr ? 'الهيئة الأكاديمية' : 'Faculty Members'}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/admissions`} className="hover:text-white hover:underline transition-colors">
                  {isAr ? 'القبول والتسجيل' : 'Admissions'}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/elearning`} className="hover:text-white hover:underline transition-colors">
                  {isAr ? 'منظومة التعلم الإلكتروني' : 'E-Learning Platform'}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/library`} className="hover:text-white hover:underline transition-colors">
                  {isAr ? 'المكتبة الرقمية' : 'Digital Library'}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/calendar`} className="hover:text-white hover:underline transition-colors">
                  {isAr ? 'التقويم الأكاديمي' : 'Academic Calendar'}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/accreditation`} className="hover:text-white hover:underline transition-colors">
                  {isAr ? 'الجودة والاعتماد' : 'Quality & Accreditation'}
                </Link>
              </li>
              <li>
                <Link to={`/${locale}/news`} className="hover:text-white hover:underline transition-colors">
                  {isAr ? 'الأخبار والإعلانات' : 'News & Announcements'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Institutional Inquiries (Neutral, no hardcoded unverified phone/email) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#D6A53A] uppercase tracking-wider mb-4">
              {isAr ? 'الدعم والاستفسارات' : 'Support & Inquiries'}
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              {isAr
                ? 'يمكن للمستفيدين والطلبة تقديم الاستفسارات ومتابعة الطلبات الأكاديمية عبر بوابة التواصل الرسمية.'
                : 'Students and applicants may submit inquiries and track requests through official academy channels.'}
            </p>
            <div className="pt-2">
              <Link
                to={`/${locale}/contact`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/10"
              >
                <HelpCircle size={14} className="text-[#D6A53A]" />
                <span>{isAr ? 'بوابة التواصل والدعم' : 'Contact & Support Portal'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} {isAr ? 'أكاديمية نبا' : 'NABA Academy'}. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <Link to={`/${locale}/terms`} className="hover:text-white transition-colors">
              {isAr ? 'اللوائح الأكاديمية والشروط' : 'Terms & Regulations'}
            </Link>
            <span>•</span>
            <Link to={`/${locale}/privacy`} className="hover:text-white transition-colors">
              {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Link>
            <span>•</span>
            <Link to={`/${locale}/faq`} className="hover:text-white transition-colors">
              {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
