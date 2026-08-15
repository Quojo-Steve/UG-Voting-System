import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, placeholder, id, className = '', style, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
    const isDark = /bg-slate-(7|8|9)\d\d|bg-gray-(7|8|9)\d\d|text-white/.test(className);
    const labelClass = isDark ? 'text-slate-100' : 'text-slate-700';
    const helperClass = isDark ? 'text-slate-300' : 'text-slate-500';
    const selectColorClass = isDark
      ? 'text-white disabled:bg-slate-800 disabled:text-slate-300'
      : 'text-slate-900 disabled:bg-slate-50 disabled:text-slate-500';

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className={`block text-sm font-semibold ${labelClass} mb-1.5`}>
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-lg border ${isDark ? 'bg-slate-800' : 'bg-white'} px-3.5 py-2.5 text-sm ${selectColorClass} focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors disabled:cursor-not-allowed ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : isDark
                ? 'border-slate-600 hover:border-amber-400 focus:border-amber-400 focus:ring-amber-400/40'
                : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
          style={
            isDark
              ? { color: '#ffffff', WebkitTextFillColor: '#ffffff', ...style }
              : style
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className={`mt-1.5 text-xs ${helperClass}`}>{helperText}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
