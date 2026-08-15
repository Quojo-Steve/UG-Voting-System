import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { VotingTrendChart } from '../../components/common/VotingTrendChart';
import { HallTurnoutChart } from '../../components/common/HallTurnoutChart';
import { ElectorateDonutChart } from '../../components/common/ElectorateDonutChart';
import { generateHourlyVotingTrends, generateHallTurnoutData } from '../../utils/chartData';
import { electionService } from '../../services/electionService';
import { candidateService } from '../../services/candidateService';
import { Election, Candidate, ActivityLog } from '../../types';
import {
  Vote,
  Users,
  Award,
  Activity,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  BarChart3,
  Building2,
  PieChart as PieIcon,
} from 'lucide-react';

export const CommissionerDashboard: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [telemetryTab, setTelemetryTab] = useState<'timeline' | 'halls' | 'share'>('timeline');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [elecData, candData, actData] = await Promise.all([
          electionService.getElections(),
          candidateService.getCandidates(),
          electionService.getActivityLogs(),
        ]);
        setElections(elecData);
        setCandidates(candData);
        setActivityLogs(actData);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading Commissioner Dashboard..." />;
  }

  const liveElection = elections.find((e) => e.status === 'LIVE') || elections[0];
  const approvedCandidates = candidates.filter((c) => c.status === 'APPROVED');
  const pendingCandidates = candidates.filter((c) => c.status === 'PENDING');
  const totalRegistered = elections.reduce((acc, e) => acc + (e.totalRegisteredVoters || 0), 0);

  const turnoutPercentage =
    liveElection && liveElection.totalRegisteredVoters > 0
      ? ((liveElection.totalVotesCast / liveElection.totalRegisteredVoters) * 100).toFixed(1)
      : '0.0';

  // Chart datasets derived for active live election
  const hourlyTrends = liveElection
    ? generateHourlyVotingTrends(
        liveElection.totalVotesCast,
        liveElection.totalRegisteredVoters,
        liveElection.startTime,
        liveElection.endTime
      )
    : [];

  const hallTurnoutData = liveElection
    ? generateHallTurnoutData(liveElection.totalVotesCast, liveElection.totalRegisteredVoters)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Election Commissioner Dashboard"
        description="Official control center for University of Ghana student elections and democratic oversight."
        actions={
          <Link to="/commissioner/elections/create">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Create New Election
            </Button>
          </Link>
        }
      />

      {/* Top 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Elections"
          value={elections.length}
          subValue={`${elections.filter((e) => e.status === 'LIVE').length} currently active`}
          icon={<Vote className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          label="Active Election"
          value={liveElection ? liveElection.name.split(' ')[0] + ' SRC' : 'None'}
          subValue={liveElection ? `Status: ${liveElection.status}` : 'No live election'}
          icon={<Activity className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          label="Registered Voters"
          value={totalRegistered.toLocaleString()}
          subValue="Across active registers"
          icon={<Users className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          label="Approved Candidates"
          value={approvedCandidates.length}
          subValue={`${pendingCandidates.length} pending review`}
          icon={<Award className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Featured Current Active Election Overview */}
      {liveElection && (
        <Card
          title={
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-slate-900">{liveElection.name}</span>
              <StatusBadge status={liveElection.status} />
            </div>
          }
          subtitle="Real-time voting telemetry and operational status"
          action={
            <Link to={`/commissioner/elections/${liveElection.id}`}>
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Manage Election
              </Button>
            </Link>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold uppercase text-slate-500 block mb-1">
                Registered Voters
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {liveElection.totalRegisteredVoters.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold uppercase text-slate-500 block mb-1">
                Votes Cast
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {liveElection.totalVotesCast.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-amber-800 block mb-1">
                  Voter Turnout
                </span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-amber-950">{turnoutPercentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
              <span>Turnout Progress</span>
              <span>{turnoutPercentage}% Complete</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Number(turnoutPercentage), 100)}%` }}
              />
            </div>
          </div>

          {/* Quick links bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <Link to={`/commissioner/elections/${liveElection.id}/voters`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Users className="w-3.5 h-3.5" />}
              >
                Voter Register
              </Button>
            </Link>
            <Link to={`/commissioner/elections/${liveElection.id}/candidates`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Award className="w-3.5 h-3.5" />}
              >
                Candidate Applications ({pendingCandidates.length} Pending)
              </Button>
            </Link>
            <Link to={`/commissioner/elections/${liveElection.id}/results`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<TrendingUp className="w-3.5 h-3.5" />}
              >
                Results & Publishing
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Visual Analytics & Voting Telemetry Section using Recharts */}
      {liveElection && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Live Electorate Telemetry & Voting Trends
              </h2>
              <p className="text-xs text-slate-500">
                Visualizing student turnout flows, velocity trends, and residential participation statistics.
              </p>
            </div>

            {/* Telemetry Switcher Tabs */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 border border-slate-300/80 text-xs">
              <button
                type="button"
                onClick={() => setTelemetryTab('timeline')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  telemetryTab === 'timeline'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                <span>Hourly Flow</span>
              </button>

              <button
                type="button"
                onClick={() => setTelemetryTab('halls')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  telemetryTab === 'halls'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Hall Turnout</span>
              </button>

              <button
                type="button"
                onClick={() => setTelemetryTab('share')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  telemetryTab === 'share'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Turnout Share</span>
              </button>
            </div>
          </div>

          {/* Active Chart Display */}
          {telemetryTab === 'timeline' && (
            <VotingTrendChart
              data={hourlyTrends}
              totalVotesCast={liveElection.totalVotesCast}
              totalRegistered={liveElection.totalRegisteredVoters}
            />
          )}

          {telemetryTab === 'halls' && (
            <HallTurnoutChart data={hallTurnoutData} />
          )}

          {telemetryTab === 'share' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ElectorateDonutChart
                totalRegistered={liveElection.totalRegisteredVoters}
                totalVotesCast={liveElection.totalVotesCast}
                title="Active Election Turnout Share"
                subtitle={liveElection.name}
              />
              <Card title="Electorate Demographics & Overview" subtitle="Participation breakdown">
                <div className="space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700">Total Valid Ballots:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {liveElection.totalVotesCast.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      All ballots checked for single-voter integrity and zero duplicate tokens.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700">Electorate Roll Total:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {liveElection.totalRegisteredVoters.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Verified undergraduate and postgraduate student register.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-amber-900">Participation Threshold:</span>
                      <span className="font-mono font-bold text-amber-950">
                        {turnoutPercentage}% Achieved
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Exceeds standard 30% statutory quorum for University of Ghana student elections.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Grid: Recent Elections & Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elections list */}
        <Card
          title="All Managed Elections"
          action={
            <Link to="/commissioner/elections">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {elections.map((elec) => (
              <div
                key={elec.id}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <Link
                    to={`/commissioner/elections/${elec.id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-amber-700 transition-colors truncate block"
                  >
                    {elec.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {elec.startDate} • {elec.positions.length} Positions •{' '}
                    {elec.totalRegisteredVoters.toLocaleString()} Voters
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={elec.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity Log */}
        <Card
          title="Recent Commission Activity"
          subtitle="Audit log of key electoral events"
        >
          <div className="space-y-4">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 mt-0.5 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 truncate">{log.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-snug">{log.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
