import React from 'react';
import { Candidate } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { User, Building2, BookOpen, GraduationCap, Check, X, FileText } from 'lucide-react';

export interface CandidateCardProps {
  candidate: Candidate;
  onApprove?: (candidate: Candidate) => void;
  onReject?: (candidate: Candidate) => void;
  onViewDetails?: (candidate: Candidate) => void;
  showActions?: boolean;
  className?: string;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onApprove,
  onReject,
  onViewDetails,
  showActions = false,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
              {candidate.avatarUrl ? (
                <img
                  src={candidate.avatarUrl}
                  alt={candidate.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {candidate.fullName}
              </h4>
              <p className="text-xs font-semibold text-amber-700 mt-0.5">
                {candidate.positionName}
              </p>
            </div>
          </div>
          <StatusBadge status={candidate.status} size="sm" />
        </div>

        {candidate.runningMate && (
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900">
            <span className="font-semibold text-amber-950">Running Mate:</span>{' '}
            {candidate.runningMate}
          </div>
        )}

        <div className="space-y-1 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono text-slate-700">{candidate.studentId}</span>
            {candidate.level && <span>• {candidate.level}</span>}
          </div>
          {candidate.hallOfResidence && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{candidate.hallOfResidence}</span>
            </div>
          )}
          {candidate.department && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{candidate.department}</span>
            </div>
          )}
        </div>

        {candidate.manifesto && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Manifesto Summary
            </p>
            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
              "{candidate.manifesto}"
            </p>
          </div>
        )}

        {candidate.reviewNotes && candidate.status === 'REJECTED' && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            <span className="font-semibold">Rejection Note:</span> {candidate.reviewNotes}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(candidate)}
            leftIcon={<FileText className="w-3.5 h-3.5" />}
          >
            View Details
          </Button>
        )}

        {showActions && candidate.status === 'PENDING' && (
          <div className="flex items-center gap-2 ml-auto">
            {onReject && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(candidate)}
                leftIcon={<X className="w-3.5 h-3.5 text-red-600" />}
                className="hover:border-red-300 hover:text-red-700"
              >
                Reject
              </Button>
            )}
            {onApprove && (
              <Button
                variant="success"
                size="sm"
                onClick={() => onApprove(candidate)}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Approve
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
