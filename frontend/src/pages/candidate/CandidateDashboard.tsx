import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { candidateService } from '../../services/candidateService';
import { electionService } from '../../services/electionService';
import { Candidate, Election } from '../../types';
import {
  User,
  GraduationCap,
  Building2,
  BookOpen,
  Award,
  Vote,
  TrendingUp,
  FileEdit,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState<Candidate | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cand, elecs] = await Promise.all([
          candidateService.getMyCandidateProfile(),
          electionService.getElections(),
        ]);
        setCandidateProfile(cand);
        setElections(elecs);
      } catch (err) {
        console.error('Failed to load candidate dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingState message="Loading candidate profile..." />;

  const appliedElection = candidateProfile
    ? elections.find((e) => e.id === candidateProfile.electionId)
    : null;

  const registrationOpenElections = elections.filter((e) => e.status === 'REGISTRATION');
  const resultsPublishedElections = elections.filter((e) => e.status === 'RESULTS_PUBLISHED');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.fullName || 'Candidate'}`}
        description="University of Ghana Aspirant Portal — Nomination papers, vetting status, and results."
        actions={
          <div className="flex items-center gap-3">
            <Link to="/candidate/elections">
              <Button variant="secondary" size="sm" leftIcon={<Vote className="w-4 h-4" />}>
                Browse Elections
              </Button>
            </Link>
          </div>
        }
      />

      {/* Candidate Bio & Nomination Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 col: Aspirant Profile Card */}
        <Card title="Aspirant Profile" className="h-fit">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xl shrink-0">
                {user?.fullName
                  ? user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'UG'}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">{user?.fullName}</h3>
                <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Matriculated Aspirant
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Student ID:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {user?.studentId || '10982341'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Hall:
                </span>
                <span className="font-semibold text-slate-800">
                  {user?.hallOfResidence || 'Commonwealth Hall'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Department:
                </span>
                <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                  {user?.department || 'Computer Science'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right 2 cols: Active Candidacy / Application Status */}
        <div className="lg:col-span-2 space-y-6">
          {candidateProfile ? (
            <Card
              title="Official Candidacy Status"
              subtitle={appliedElection?.name || 'Election Candidacy'}
              action={<StatusBadge status={candidateProfile.status} size="md" />}
            >
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                        Contested Portfolio
                      </span>
                      <h4 className="text-lg font-bold text-slate-900">
                        {candidateProfile.positionName}
                      </h4>
                    </div>
                    {candidateProfile.runningMate && (
                      <div className="text-xs text-amber-900 bg-amber-100/70 px-3 py-1 rounded-lg border border-amber-200">
                        <span className="font-bold">Running Mate:</span>{' '}
                        {candidateProfile.runningMate}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Submitted Manifesto Summary
                    </span>
                    <p className="text-xs text-slate-700 italic leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      "{candidateProfile.manifesto}"
                    </p>
                  </div>
                </div>

                {/* Status Guidance */}
                {candidateProfile.status === 'APPROVED' && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-900">
                      <p className="font-bold text-emerald-950">
                        Nomination Vetted & Approved for Ballot
                      </p>
                      <p className="mt-0.5">
                        Your candidature has been officially certified by the University Electoral
                        Commission. Your name and manifesto will appear on all eligible student
                        ballots during the voting period.
                      </p>
                    </div>
                  </div>
                )}

                {candidateProfile.status === 'PENDING' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900">
                      <p className="font-bold text-amber-950">Vetting & Review in Progress</p>
                      <p className="mt-0.5">
                        Your nomination papers and academic eligibility are currently undergoing
                        audit by the Commission. You will be notified once vetted.
                      </p>
                    </div>
                  </div>
                )}

                {candidateProfile.status === 'REJECTED' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-300 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-900">
                      <p className="font-bold text-red-950">Nomination Disqualified</p>
                      <p className="mt-0.5">
                        {candidateProfile.reviewNotes ||
                          'Application did not satisfy candidate eligibility regulations.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-3">
                  <Link to="/candidate/results">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<TrendingUp className="w-4 h-4" />}
                    >
                      View Election Results
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="No Active Candidacy Filed">
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Ready to run for student executive office?
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Browse open elections with active registration windows, pick your contested
                  portfolio, and submit your campaign manifesto.
                </p>
                <div className="pt-2">
                  <Link to="/candidate/elections">
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Browse Open Elections
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {/* Open Elections List */}
          <Card
            title="Open Registration Elections"
            subtitle="Student elections currently accepting candidate filings"
          >
            {registrationOpenElections.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">
                No elections currently have open registration windows.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {registrationOpenElections.map((elec) => (
                  <div key={elec.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{elec.name}</h4>
                      <p className="text-xs text-slate-500">
                        {elec.positions.length} Portfolios • Voting: {elec.startDate}
                      </p>
                    </div>
                    <Link to={`/candidate/elections/${elec.id}/apply`}>
                      <Button variant="outline" size="sm">
                        File Nomination
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
