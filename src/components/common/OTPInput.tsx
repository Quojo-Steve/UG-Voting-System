import React, { useRef, useEffect } from 'react';

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  isError?: boolean;
  onComplete?: (code: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
  isError = false,
  onComplete,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current = inputsRef.current.slice(0, length);
    // Focus first empty input or the first box
    if (!disabled && inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, [length, disabled]);

  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  const handleChange = (index: number, val: string) => {
    if (disabled) return;
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const newDigits = [...digits];
      newDigits[index] = '';
      const newVal = newDigits.join('');
      onChange(newVal);
      return;
    }

    if (clean.length > 1) {
      // Pasted multiple digits
      const pastedDigits = clean.slice(0, length).split('');
      const newDigits = [...digits];
      for (let i = 0; i < length; i++) {
        if (pastedDigits[i]) {
          newDigits[i] = pastedDigits[i];
        }
      }
      const newVal = newDigits.join('');
      onChange(newVal);
      const nextIndex = Math.min(clean.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
      if (newVal.length === length && onComplete) {
        onComplete(newVal);
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean[0];
    const newVal = newDigits.join('');
    onChange(newVal);

    // Auto advance focus
    if (clean && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newVal.length === length && onComplete) {
      onComplete(newVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[focusIdx]?.focus();

    if (pasted.length === length && onComplete) {
      onComplete(pasted);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={`w-11 h-13 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border bg-white shadow-xs focus:outline-none transition-all ${
            isError
              ? 'border-red-400 text-red-700 focus:ring-2 focus:ring-red-400'
              : digits[index]
              ? 'border-slate-800 text-slate-900 bg-slate-50/50 focus:ring-2 focus:ring-slate-900'
              : 'border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-slate-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};
