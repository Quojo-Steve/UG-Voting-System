import React from 'react';
import { Position, Candidate } from '../../types';
import { User, CheckCircle2, Circle } from 'lucide-react';

export interface BallotPositionProps {
  position: Position;
  candidates: Candidate[];
  selectedCandidateId?: string;
  onSelectCandidate: (positionId: string, candidateId: string) => void;
  className?: string;
}

export const BallotPosition: React.FC<BallotPositionProps> = ({
  position,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  className = '',
}) => {
  return (
    <div
      id={`ballot-position-${position.id}`}
      className={`bg-white rounded-2xl border-2 transition-all p-5 sm:p-6 shadow-xs ${
        selectedCandidateId ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200'
      } ${className}`}
    >
      {/* Position Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-5">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700 block">
            Position {position.order}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {position.name}
          </h3>
        </div>
        <div>
          {selectedCandidateId ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Choice Selected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              Selection Required
            </span>
          )}
        </div>
      </div>

      {/* Candidate Radio List */}
      {candidates.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          No candidates currently contesting for this position.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" role="radiogroup" aria-label={position.name}>
          {candidates.map((cand) => {
            const isSelected = selectedCandidateId === cand.id;
            return (
              <div
                key={cand.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onClick={() => onSelectCandidate(position.id, cand.id)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onSelectCandidate(position.id, cand.id);
                  }
                }}
                className={`relative flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-900'
                }`}
              >
                {/* Radio Circle Indicator */}
                <div className="mt-0.5 shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>

                {/* Candidate Avatar */}
                <div
                  className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border flex items-center justify-center ${
                    isSelected ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
                  }`}
                >
                  {cand.avatarUrl ? (
                    <img
                      src={cand.avatarUrl}
                      alt={cand.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      className={`w-6 h-6 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {cand.fullName}
                  </h4>
                  {cand.runningMate && (
                    <p
                      className={`text-xs mt-0.5 truncate ${
                        isSelected ? 'text-amber-300' : 'text-amber-800'
                      }`}
                    >
                      <span className="opacity-80">Mate:</span> {cand.runningMate}
                    </p>
                  )}
                  <p
                    className={`text-[11px] mt-1 line-clamp-2 leading-tight ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {cand.hallOfResidence || cand.department || 'UG Student'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
