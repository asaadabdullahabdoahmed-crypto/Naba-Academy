import React from 'react';
import type { BadgeVariant } from '../../types';

export type { BadgeVariant };

interface StatusBadgeProps {
  variant?: BadgeVariant;
  label: string;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant = 'neutral',
  label,
  dot = true,
  size = 'md',
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string; border: string }> = {
    success: {
      bg: 'bg-[#e7f4f1]',
      text: 'text-[#16835d]',
      dotColor: 'bg-[#16835d]',
      border: 'border-[#16835d]/20',
    },
    warning: {
      bg: 'bg-[#fef7ea]',
      text: 'text-[#d97706]',
      dotColor: 'bg-[#d97706]',
      border: 'border-[#d97706]/20',
    },
    danger: {
      bg: 'bg-[#fef2f2]',
      text: 'text-[#c23b3b]',
      dotColor: 'bg-[#c23b3b]',
      border: 'border-[#c23b3b]/20',
    },
    info: {
      bg: 'bg-[#eff6ff]',
      text: 'text-[#2563eb]',
      dotColor: 'bg-[#2563eb]',
      border: 'border-[#2563eb]/20',
    },
    primary: {
      bg: 'bg-[#eaf0f5]',
      text: 'text-[#17324d]',
      dotColor: 'bg-[#17324d]',
      border: 'border-[#17324d]/20',
    },
    neutral: {
      bg: 'bg-[#f8fafc]',
      text: 'text-[#667085]',
      dotColor: 'bg-[#667085]',
      border: 'border-[#e4e7ec]',
    },
  };

  const current = variantStyles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} whitespace-nowrap`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dotColor} shrink-0`} />}
      <span>{label}</span>
    </span>
  );
};
