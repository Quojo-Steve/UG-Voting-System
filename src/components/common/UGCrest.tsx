import React from 'react';

interface UGCrestProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showMotto?: boolean;
  className?: string;
}

export const UGCrest: React.FC<UGCrestProps> = ({ size = 'md', showMotto = false, className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        id="ug-crest-emblem"
        className={`${sizeMap[size]} relative flex items-center justify-center rounded-xl bg-slate-900 border-2 border-amber-500 shadow-md text-amber-400 font-serif font-black select-none`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shield base */}
          <path
            d="M50 8 L85 22 V52 C85 72 50 92 50 92 C50 92 15 72 15 52 V22 L50 8 Z"
            fill="#0F172A"
            stroke="#D97706"
            strokeWidth="4"
          />
          {/* Inner heraldic chevron / book / tree symbol */}
          <path d="M50 20 L75 32 V50 C75 64 50 78 50 78 C50 78 25 64 25 50 V32 L50 20 Z" fill="#1E293B" />
          {/* Open Book of Knowledge */}
          <path
            d="M32 42 Q50 38 50 48 Q50 38 68 42 V58 Q50 54 50 64 Q50 54 32 58 Z"
            fill="#F59E0B"
            stroke="#FEF3C7"
            strokeWidth="1.5"
          />
          {/* Golden Sun / Star */}
          <circle cx="50" cy="30" r="4.5" fill="#FBBF24" />
        </svg>
      </div>
      {showMotto && (
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-700">
            University of Ghana
          </span>
          <span className="text-[11px] font-serif italic text-slate-500">
            Integri Procedamus
          </span>
        </div>
      )}
    </div>
  );
};
