import React from 'react';
import { PageHeader } from '../layout/PageHeader';
import { StatCard } from '../ui/StatCard';
import { DataTableShell } from '../ui/DataTableShell';
import type { StatItem, BreadcrumbItem } from '../../types';

export type { StatItem };

interface PortalPageProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  stats?: StatItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  locale?: 'ar' | 'en';
  children?: React.ReactNode;
}

export const PortalPage: React.FC<PortalPageProps> = ({
  title,
  subtitle,
  breadcrumbs,
  stats,
  actions,
  badge,
  locale = 'ar',
  children,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={actions}
        badge={badge}
        locale={locale}
      />

      {/* KPI Stats Row */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st, idx) => (
            <StatCard
              key={idx}
              title={st.title}
              value={st.value}
              change={st.change}
              isPositive={st.isPositive}
              subtitle={st.subtitle}
              iconName={st.iconName}
              accentColor={st.accentColor}
            />
          ))}
        </div>
      )}

      {/* Main Page Slot */}
      {children}
    </div>
  );
};
