import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, maxLength, currentLength, id, className = '', ...props }, ref) => {
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700">
              {label}
              {props.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
          {maxLength && (
            <span className="text-xs text-slate-400">
              {currentLength ?? 0} / {maxLength}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          maxLength={maxLength}
          rows={props.rows || 4}
          className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
