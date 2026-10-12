import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';
import type { BreadcrumbItem } from '../../types';

export type { BreadcrumbItem };

interface PageHeaderProps {
  id?: string;
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  locale?: 'ar' | 'en';
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  id,
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  badge,
  locale,
}) => {
  const { isAr: ctxIsAr } = useTranslation();
  const isAr = locale !== undefined ? locale === 'ar' : ctxIsAr;
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <div id={id} className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#607086] mb-1.5 flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-[#082B50] hover:underline transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#102033] font-semibold">{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && (
                  <ArrowIcon size={12} className="text-[#607086]/60 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-[#102033] tracking-tight">{title}</h1>
          {badge}
        </div>

        {subtitle && (
          <p className="text-xs text-[#607086] mt-1 leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
