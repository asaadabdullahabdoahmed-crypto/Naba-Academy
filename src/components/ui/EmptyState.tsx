import React from 'react';
import { Inbox } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface EmptyStateProps {
  title?: string;
  desc?: string;
  actionLabel?: string;
  titleAr?: string;
  titleEn?: string;
  descAr?: string;
  descEn?: string;
  actionLabelAr?: string;
  actionLabelEn?: string;
  onAction?: () => void;
  locale?: 'ar' | 'en';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  desc,
  actionLabel,
  titleAr,
  titleEn,
  descAr,
  descEn,
  actionLabelAr,
  actionLabelEn,
  onAction,
  locale,
}) => {
  const { d, isAr: ctxIsAr } = useTranslation();
  const isAr = locale !== undefined ? locale === 'ar' : ctxIsAr;
  const v = d.views.shared.emptyState;

  const resolvedTitle = title ?? (titleAr || titleEn ? (isAr ? titleAr : titleEn) : v.defaultTitle);
  const resolvedDesc = desc ?? (descAr || descEn ? (isAr ? descAr : descEn) : v.defaultDesc);
  const resolvedActionLabel = actionLabel ?? (actionLabelAr || actionLabelEn ? (isAr ? actionLabelAr : actionLabelEn) : undefined);

  return (
    <div className="bg-white rounded-xl border border-[#e4e7ec] p-8 md:p-12 text-center flex flex-col items-center justify-center">
      <div className="w-14 h-14 rounded-2xl bg-[#eaf0f5] text-[#17324d] flex items-center justify-center mb-4">
        <Inbox size={28} />
      </div>
      <h4 className="text-base font-bold text-[#17202a] mb-1.5">{resolvedTitle}</h4>
      <p className="text-xs text-[#667085] max-w-sm mb-5 leading-relaxed">{resolvedDesc}</p>
      {resolvedActionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 bg-[#17324d] hover:bg-[#17324d]/90 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          {resolvedActionLabel}
        </button>
      )}
    </div>
  );
};
