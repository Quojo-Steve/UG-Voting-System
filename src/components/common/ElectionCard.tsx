import React from 'react';
import { Election } from '../../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';
import { Calendar, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ElectionCardProps {
  election: Election;
  portal?: 'commissioner' | 'candidate' | 'voter';
  onAction?: () => void;
  className?: string;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({
  election,
  portal = 'commissioner',
  className = '',
}) => {
  const getActionLink = () => {
    switch (portal) {
      case 'candidate':
        return `/candidate/elections/${election.id}/apply`;
      case 'voter':
        return `/vote`;
      default:
        return `/commissioner/elections/${election.id}`;
    }
  };

  const getActionLabel = () => {
    switch (portal) {
      case 'candidate':
        return election.status === 'REGISTRATION' ? 'Apply as Candidate' : 'View Positions';
      case 'voter':
        return 'Enter Voter Portal';
      default:
        return 'Manage Election';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              University of Ghana
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
              {election.name}
            </h3>
          </div>
          <StatusBadge status={election.status} />
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {election.description}
        </p>

        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 mb-4 bg-slate-50/50 rounded-lg px-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Voting Window
              </span>
              <span className="text-xs font-medium text-slate-700 truncate block">
                {election.startDate} ({election.startTime} - {election.endTime})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Positions
              </span>
              <span className="text-xs font-medium text-slate-700 truncate block">
                {election.positions?.length || 0} Portfolios
              </span>
            </div>
          </div>
        </div>

        {portal === 'commissioner' && (
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Registered: {election.totalRegisteredVoters?.toLocaleString() || 0}</span>
            </div>
            <div>
              Votes Cast:{' '}
              <span className="font-semibold text-slate-900">
                {election.totalVotesCast?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link to={getActionLink()} className="w-full block">
          <Button
            variant={portal === 'voter' ? 'secondary' : 'primary'}
            size="sm"
            className="w-full justify-between"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {getActionLabel()}
          </Button>
        </Link>
      </div>
    </div>
  );
};
