import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  minHeight?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  minHeight = 'min-h-[240px]',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-white border border-slate-200 ${minHeight} ${className}`}
    >
      <Loader2 className="w-8 h-8 animate-spin text-slate-700 mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
