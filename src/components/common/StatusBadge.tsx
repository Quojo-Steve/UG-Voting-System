import React from 'react';
import { ElectionStatus, CandidateStatus, VoterStatus } from '../../types';

export interface StatusBadgeProps {
  status: ElectionStatus | CandidateStatus | VoterStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const norm = status.toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let label = status;

  switch (norm) {
    // Election Statuses
    case 'LIVE':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      dotColor = 'bg-emerald-500 animate-pulse';
      label = 'LIVE';
      break;
    case 'REGISTRATION':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      dotColor = 'bg-amber-500';
      label = 'REGISTRATION OPEN';
      break;
    case 'READY':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
      dotColor = 'bg-blue-500';
      label = 'READY FOR VOTING';
      break;
    case 'DRAFT':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      label = 'DRAFT';
      break;
    case 'CLOSED':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
      dotColor = 'bg-rose-500';
      label = 'VOTING CLOSED';
      break;
    case 'RESULTS_PUBLISHED':
    case 'RESULTS PUBLISHED':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200 font-semibold';
      dotColor = 'bg-purple-500';
      label = 'RESULTS PUBLISHED';
      break;

    // Candidate Statuses
    case 'APPROVED':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
      dotColor = 'bg-emerald-500';
      label = 'APPROVED';
      break;
    case 'PENDING':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      dotColor = 'bg-amber-500';
      label = 'PENDING APPROVAL';
      break;
    case 'REJECTED':
      colorClasses = 'bg-red-50 text-red-700 border-red-200 font-medium';
      dotColor = 'bg-red-500';
      label = 'REJECTED';
      break;

    // Voter Statuses
    case 'ELIGIBLE':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      label = 'ELIGIBLE';
      break;
    case 'VOTED':
      colorClasses = 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
      dotColor = 'bg-sky-500';
      label = 'VOTED';
      break;
    case 'INVALID':
      colorClasses = 'bg-red-50 text-red-700 border-red-200';
      dotColor = 'bg-red-500';
      label = 'INVALID';
      break;

    default:
      label = status;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs select-none ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span className="leading-none whitespace-nowrap">{label}</span>
    </span>
  );
};
