import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { ResultChart } from '../../components/common/ResultChart';
import { Select } from '../../components/common/Select';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { electionService } from '../../services/electionService';
import { Election, ElectionResults } from '../../types';
import { TrendingUp, Users, Vote, Trophy, ShieldCheck } from 'lucide-react';

export const CandidateResults: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    electionService
      .getElections()
      .then((elecs) => {
        setElections(elecs);
        const pub = elecs.find((e) => e.status === 'RESULTS_PUBLISHED') || elecs[0];
        if (pub) {
          setSelectedElectionId(pub.id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedElectionId) return;
    setLoading(true);
    electionService
      .getElectionResults(selectedElectionId)
      .then((res) => setResults(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedElectionId]);

  const selectedElection = elections.find((e) => e.id === selectedElectionId);

  const electionOptions = elections.map((e) => ({
    label: `${e.name} (${e.status})`,
    value: e.id,
  }));

  if (loading && elections.length === 0) {
    return <LoadingState message="Loading certified results..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Election Results"
        description="Publicly published and audited returns for University of Ghana student elections."
        backTo="/candidate/dashboard"
        backLabel="Back to Dashboard"
      />

      {/* Select Election dropdown */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Select
            label="Select Election"
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            options={electionOptions}
          />
        </div>

        {selectedElection && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedElection.status === 'RESULTS_PUBLISHED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {selectedElection.status}
            </span>
          </div>
        )}
      </div>

      {/* Metrics */}
      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Registered Voters"
            value={results.totalRegisteredVoters.toLocaleString()}
            subValue="Electorate size"
            icon={<Users className="w-5 h-5 text-sky-600" />}
          />
          <StatCard
            label="Ballots Cast"
            value={results.totalVotesCast.toLocaleString()}
            subValue="Verified votes"
            icon={<Vote className="w-5 h-5 text-emerald-600" />}
          />
          <StatCard
            label="Voter Turnout"
            value={`${results.turnoutPercentage}%`}
            subValue="Overall voter turnout"
            icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
          />
        </div>
      )}

      {/* Position Charts */}
      {results && results.positions.length > 0 ? (
        <div className="space-y-6">
          {results.positions.map((pos) => (
            <ResultChart key={pos.positionId} positionResult={pos} showWinnerBadge={true} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No results published for this election yet"
          description="The Electoral Commission has not yet certified and published results for this election."
        />
      )}
    </div>
  );
};
