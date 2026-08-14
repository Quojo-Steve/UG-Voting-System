import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  backTo,
  backLabel = 'Back',
  actions,
  className = '',
}) => {
  return (
    <div className={`mb-6 md:mb-8 ${className}`}>
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{backLabel}</span>
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            {badge && <div>{badge}</div>}
          </div>
          {description && (
            <div className="mt-1.5 text-sm text-slate-500 max-w-3xl leading-relaxed">
              {description}
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
};
