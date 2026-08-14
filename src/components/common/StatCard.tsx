import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
          {trend && (
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subValue && <p className="mt-1 text-xs text-slate-500 truncate">{subValue}</p>}
      </div>
      {icon && (
        <div className="p-3 rounded-xl bg-slate-100/80 text-slate-700 shrink-0 border border-slate-200/50">
          {icon}
        </div>
      )}
    </div>
  );
};
