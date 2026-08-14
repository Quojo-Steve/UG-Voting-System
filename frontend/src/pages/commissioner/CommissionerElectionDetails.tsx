import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { useToast } from '../../context/ToastContext';
import { electionService } from '../../services/electionService';
import { candidateService } from '../../services/candidateService';
import { voterService } from '../../services/voterService';
import { Election, Candidate, ElectionStatus } from '../../types';
import {
  Calendar,
  Clock,
  Award,
  Users,
  Vote,
  Play,
  Pause,
  CheckCircle,
  FileSpreadsheet,
  TrendingUp,
  UserCheck,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const CommissionerElectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status modal state
  const [pendingStatus, setPendingStatus] = useState<ElectionStatus | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [elec, cands] = await Promise.all([
        electionService.getElectionById(id),
        candidateService.getCandidates(id),
      ]);
      setElection(elec);
      setCandidates(cands);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve election details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleStatusChangeConfirm = async () => {
    if (!id || !pendingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await electionService.updateElectionStatus(id, pendingStatus);
      setElection(updated);
      addToast(`Election status transitioned to ${pendingStatus}`, 'success', 'Status Updated');
    } catch (err: any) {
      addToast(err.message || 'Failed to update election status.', 'error', 'Error');
    } finally {
      setIsUpdatingStatus(false);
      setPendingStatus(null);
    }
  };

  if (loading) return <LoadingState message="Loading election overview..." />;
  if (error || !election) {
    return <ErrorState message={error || 'Election not found'} onRetry={loadData} />;
  }

  const approvedCandidates = candidates.filter((c) => c.status === 'APPROVED');
  const pendingCandidates = candidates.filter((c) => c.status === 'PENDING');

  const getStatusActionButtons = () => {
    switch (election.status) {
      case 'DRAFT':
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPendingStatus('REGISTRATION')}
            leftIcon={<UserCheck className="w-4 h-4" />}
          >
            Open Candidate Registration
          </Button>
        );
      case 'REGISTRATION':
        return (
          <div className="flex gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => setPendingStatus('LIVE')}
              leftIcon={<Play className="w-4 h-4" />}
            >
              Launch Live Voting
            </Button>
          </div>
        );
      case 'LIVE':
        return (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setPendingStatus('CLOSED')}
            leftIcon={<Pause className="w-4 h-4" />}
          >
            Close Voting Polls
          </Button>
        );
      case 'CLOSED':
        return (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPendingStatus('RESULTS_PUBLISHED')}
            leftIcon={<CheckCircle className="w-4 h-4" />}
          >
            Publish Certified Results
          </Button>
        );
      case 'RESULTS_PUBLISHED':
        return (
          <Link to={`/commissioner/elections/${election.id}/results`}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<TrendingUp className="w-4 h-4" />}
            >
              View Official Results
            </Button>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={election.name}
        description={election.description}
        backTo="/commissioner/elections"
        backLabel="All Elections"
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={election.status} size="lg" />
            {getStatusActionButtons()}
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Voters"
          value={election.totalRegisteredVoters.toLocaleString()}
          subValue="Verified in register"
          icon={<Users className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          label="Votes Cast"
          value={election.totalVotesCast.toLocaleString()}
          subValue={
            election.totalRegisteredVoters > 0
              ? `${((election.totalVotesCast / election.totalRegisteredVoters) * 100).toFixed(1)}% Turnout`
              : '0% Turnout'
          }
          icon={<Vote className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          label="Approved Candidates"
          value={approvedCandidates.length}
          subValue={`${pendingCandidates.length} pending approval`}
          icon={<UserCheck className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          label="Portfolios Contested"
          value={election.positions.length}
          subValue="Executive offices"
          icon={<Award className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to={`/commissioner/elections/${election.id}/voters`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              Voter Register
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Upload Excel registers (.xlsx/.csv), inspect voter rolls, and audit voting eligibility.
            </p>
          </div>
          <div className="pt-4 mt-2 flex items-center text-xs font-bold text-sky-700 group-hover:text-amber-700">
            <span>Manage Voters</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          to={`/commissioner/elections/${election.id}/candidates`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 w-fit mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              Candidate Applications
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Review aspirant qualifications, approve or reject applications, and vet manifestos.
            </p>
          </div>
          <div className="pt-4 mt-2 flex items-center text-xs font-bold text-purple-700 group-hover:text-amber-700">
            <span>Review Candidates ({pendingCandidates.length} Pending)</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <Link
          to={`/commissioner/elections/${election.id}/results`}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 w-fit mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              Results & Telemetry
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Real-time vote tallies, percentage breakdowns, rank calculation, and official publishing.
            </p>
          </div>
          <div className="pt-4 mt-2 flex items-center text-xs font-bold text-emerald-700 group-hover:text-amber-700">
            <span>View Results</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Election Configurations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Voting Window Details">
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">Date of Voting:</span>
              <span className="font-medium text-slate-900">{election.startDate}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">Poll Hours:</span>
              <span className="font-medium text-slate-900">
                {election.startTime} - {election.endTime} GMT
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
              <span className="font-semibold text-slate-700">Created Timestamp:</span>
              <span className="font-medium text-slate-900">
                {new Date(election.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        <Card title={`Contested Portfolios (${election.positions.length})`}>
          <div className="divide-y divide-slate-100">
            {election.positions.map((pos) => (
              <div key={pos.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-center">
                    {pos.order}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{pos.name}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {candidates.filter((c) => c.positionId === pos.id && c.status === 'APPROVED')
                    .length}{' '}
                  Candidates
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Status Transition Confirmation Modal */}
      <ConfirmationDialog
        isOpen={Boolean(pendingStatus)}
        title={`Confirm Status Transition: ${pendingStatus}`}
        message={`Are you sure you want to transition this election to "${pendingStatus}"? This will immediately affect student ballot access and registration permissions.`}
        confirmText={`Transition to ${pendingStatus}`}
        variant={pendingStatus === 'CLOSED' ? 'danger' : 'primary'}
        isLoading={isUpdatingStatus}
        onConfirm={handleStatusChangeConfirm}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
};
