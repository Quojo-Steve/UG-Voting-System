import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, maxLength, currentLength, id, className = '', style, ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const isDark = /bg-slate-(7|8|9)\d\d|bg-gray-(7|8|9)\d\d|text-white/.test(className);
    const labelClass = isDark ? 'text-slate-100' : 'text-slate-700';
    const helperClass = isDark ? 'text-slate-300' : 'text-slate-500';
    const textareaColorClass = isDark
      ? 'text-white placeholder:text-slate-300 caret-amber-300 disabled:bg-slate-800 disabled:text-slate-300'
      : 'text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500';

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label htmlFor={textareaId} className={`block text-sm font-semibold ${labelClass}`}>
              {label}
              {props.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
          {maxLength && (
            <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-400'}`}>
              {currentLength ?? 0} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          maxLength={maxLength}
          rows={props.rows || 4}
          className={`block w-full rounded-lg border ${isDark ? 'bg-slate-800' : 'bg-white'} px-3.5 py-2.5 text-sm ${textareaColorClass} focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors disabled:cursor-not-allowed ${
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
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className={`mt-1.5 text-xs ${helperClass}`}>{helperText}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
