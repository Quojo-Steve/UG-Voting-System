import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { ResultChart } from '../../components/common/ResultChart';
import { VotingTrendChart } from '../../components/common/VotingTrendChart';
import { HallTurnoutChart } from '../../components/common/HallTurnoutChart';
import { ElectorateDonutChart } from '../../components/common/ElectorateDonutChart';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../context/ToastContext';
import { electionService } from '../../services/electionService';
import { Election, ElectionResults } from '../../types';
import { generateHourlyVotingTrends, generateHallTurnoutData } from '../../utils/chartData';
import {
  TrendingUp,
  Users,
  Vote,
  Share2,
  Printer,
  CheckCircle2,
  Award,
  Clock,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  Building2,
  Layers,
} from 'lucide-react';

export const CommissionerResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();

  const [election, setElection] = useState<Election | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [analyticsView, setAnalyticsView] = useState<'portfolios' | 'trends' | 'halls' | 'all'>('portfolios');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [elec, res] = await Promise.all([
        electionService.getElectionById(id),
        electionService.getElectionResults(id),
      ]);
      setElection(elec);
      setResults(res);
    } catch (err: any) {
      addToast(err.message || 'Failed to load results telemetry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handlePublishResults = async () => {
    if (!id) return;
    setIsPublishing(true);
    try {
      await electionService.updateElectionStatus(id, 'RESULTS_PUBLISHED');
      addToast(
        'Election results have been officially certified and published.',
        'success',
        'Results Published'
      );
      setPublishModalOpen(false);
      await loadData();
    } catch (err: any) {
      addToast(err.message || 'Failed to publish results.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingState message="Calculating ballot tallies and telemetry charts..." />;

  const isPublished = election?.status === 'RESULTS_PUBLISHED';

  const hourlyTrends = results
    ? generateHourlyVotingTrends(
        results.totalVotesCast,
        results.totalRegisteredVoters,
        election?.startTime || '08:00',
        election?.endTime || '17:00'
      )
    : [];

  const hallTurnoutData = results
    ? generateHallTurnoutData(results.totalVotesCast, results.totalRegisteredVoters)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Official Election Results — ${election?.name || 'Election'}`}
        description="Comprehensive vote totals, candidate rank calculations, and official certification."
        backTo={`/commissioner/elections/${id}`}
        backLabel="Back to Election"
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Tallies
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Certified Summary
            </Button>
            {!isPublished && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPublishModalOpen(true)}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Publish Certified Results
              </Button>
            )}
          </div>
        }
      />

      {/* Metrics overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          label="Registered Voters"
          value={results?.totalRegisteredVoters.toLocaleString() || '0'}
          subValue="Eligible electorate"
          icon={<Users className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          label="Total Ballots Cast"
          value={results?.totalVotesCast.toLocaleString() || '0'}
          subValue="Verified single votes"
          icon={<Vote className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          label="Voter Turnout"
          value={`${results?.turnoutPercentage || '0.0'}%`}
          subValue="Participation rate"
          icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          label="Publication State"
          value={isPublished ? 'Published' : 'Internal Audit'}
          subValue={isPublished ? 'Publicly visible' : 'Commission only'}
          icon={<ShieldCheck className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {isPublished && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Official Results Certified & Published
              </h4>
              <p className="text-xs text-emerald-800">
                These election results are final and publicly certified under the University of Ghana
                Electoral Regulations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View Selector Navigation Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>Analytics View:</span>
        </div>

        <div className="inline-flex flex-wrap p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setAnalyticsView('portfolios')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              analyticsView === 'portfolios'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Portfolio Returns ({results?.positions.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setAnalyticsView('trends')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              analyticsView === 'trends'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
            <span>Voting Velocity Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setAnalyticsView('halls')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              analyticsView === 'halls'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Hall Breakdown</span>
          </button>

          <button
            type="button"
            onClick={() => setAnalyticsView('all')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              analyticsView === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Comprehensive Audit View</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: VOTING VELOCITY & TEMPORAL TRENDS */}
      {(analyticsView === 'trends' || analyticsView === 'all') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VotingTrendChart
                data={hourlyTrends}
                totalVotesCast={results?.totalVotesCast || 0}
                totalRegistered={results?.totalRegisteredVoters || 0}
              />
            </div>
            <div>
              <ElectorateDonutChart
                totalRegistered={results?.totalRegisteredVoters || 0}
                totalVotesCast={results?.totalVotesCast || 0}
                title="Ballot Participation"
                subtitle="Cast vs uncast voter tokens"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: HALL-BY-HALL BREAKDOWN */}
      {(analyticsView === 'halls' || analyticsView === 'all') && (
        <div className="space-y-6">
          <HallTurnoutChart data={hallTurnoutData} />
        </div>
      )}

      {/* SECTION 3: PER POSITION CANDIDATE RETURNS */}
      {(analyticsView === 'portfolios' || analyticsView === 'all') && (
        <div className="space-y-6">
          {results?.positions.map((pos) => (
            <ResultChart
              key={pos.positionId}
              positionResult={pos}
              showWinnerBadge={true}
              defaultView="bars"
            />
          ))}

          {(!results || results.positions.length === 0) && (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              No position results available for this election yet.
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal to Publish */}
      <ConfirmationDialog
        isOpen={publishModalOpen}
        title="Publish Official Certified Election Results"
        message="Are you sure you want to certify and publish these results? This will make final tallies visible to all candidates, voters, and university stakeholders."
        confirmText="Yes, Publish Results"
        variant="primary"
        isLoading={isPublishing}
        onConfirm={handlePublishResults}
        onCancel={() => setPublishModalOpen(false)}
      />
    </div>
  );
};
