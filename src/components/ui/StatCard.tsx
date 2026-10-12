import React from 'react';
import * as Icons from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  iconName?: string;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  change,
  isPositive = true,
  subtitle,
  iconName = 'Activity',
  accentColor = '#082B50',
}) => {
  // Safe dynamic icon resolution
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[iconName] || Icons.Activity;

  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-[#DCE3EB] p-5 shadow-xs hover:border-[#082B50]/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#607086] mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-[#102033] tracking-tight">{value}</h3>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
        >
          <IconComponent size={20} />
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-3.5 pt-3 border-t border-[#DCE3EB]/60 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isPositive ? 'text-[#198754]' : 'text-[#C93C3C]'
              }`}
            >
              {isPositive ? '+' : ''}{change}
            </span>
          )}
          {subtitle && <span className="text-[#607086] truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
