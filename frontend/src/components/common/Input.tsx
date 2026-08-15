import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, id, className = '', style, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const isDark = /bg-slate-(7|8|9)\d\d|bg-gray-(7|8|9)\d\d|text-white/.test(className);
    const labelClass = isDark ? 'text-slate-100' : 'text-slate-700';
    const helperClass = isDark ? 'text-slate-300' : 'text-slate-500';
    const inputColorClass = isDark
      ? 'text-white placeholder:text-slate-300 caret-amber-300 disabled:bg-slate-800 disabled:text-slate-300'
      : 'text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={`block text-sm font-semibold ${labelClass} mb-1.5`}>
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-lg border ${isDark ? 'bg-slate-800' : 'bg-white'} px-3.5 py-2.5 text-sm ${inputColorClass} focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : isDark
                  ? 'border-slate-600 hover:border-amber-400 focus:border-amber-400 focus:ring-amber-400/40'
                  : 'border-slate-300 hover:border-slate-400'
            } ${className}`}
            style={
              isDark
                ? { color: '#ffffff', WebkitTextFillColor: '#ffffff', caretColor: '#fcd34d', ...style }
                : style
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className={`mt-1.5 text-xs ${helperClass}`}>{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
