import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  footer,
  noPadding = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <div className="mt-0.5 text-xs text-slate-500 font-normal">{subtitle}</div>
            )}
          </div>
          {action && <div className="shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 text-sm text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
};
