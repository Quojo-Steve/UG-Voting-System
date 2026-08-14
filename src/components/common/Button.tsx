import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 border border-slate-900 shadow-sm active:bg-slate-950',
    secondary:
      'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 border border-amber-600 shadow-sm active:bg-amber-800',
    outline:
      'bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400 border border-slate-300 shadow-xs active:bg-slate-100',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-red-600 shadow-sm active:bg-red-800',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 border border-emerald-600 shadow-sm active:bg-emerald-800',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400 border border-transparent',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
