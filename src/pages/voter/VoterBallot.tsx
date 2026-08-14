import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { BallotPosition } from '../../components/common/BallotPosition';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { voterService } from '../../services/voterService';
import { Position, Candidate, Election } from '../../types';
import { ArrowRight, CheckCircle2, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export const VoterBallot: React.FC = () => {
  const { voterSession, checkVoterSession } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [positions, setPositions] = useState<Position[]>([]);
  const [candidatesByPosition, setCandidatesByPosition] = useState<Record<string, Candidate[]>>({});
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [missingPositions, setMissingPositions] = useState<string[]>([]);

  useEffect(() => {
    if (!voterSession) {
      navigate('/vote', { replace: true });
      return;
    }

    async function loadBallot() {
      try {
        const ballotData = await voterService.getBallot(voterSession!.electionId);
        setPositions(ballotData.positions);

        const candMap: Record<string, Candidate[]> = {};
        ballotData.positions.forEach((pos) => {
          candMap[pos.id] = ballotData.candidates.filter(
            (c) => c.positionId === pos.id && c.status === 'APPROVED'
          );
        });
        setCandidatesByPosition(candMap);

        // Restore any saved temporary selections from sessionStorage
        const saved = sessionStorage.getItem('ug_ballot_selections');
        if (saved) {
          try {
            setSelections(JSON.parse(saved));
          } catch (e) {
            // ignore
          }
        }
      } catch (err: any) {
        addToast(err.message || 'Failed to load official ballot.', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadBallot();
  }, [voterSession, navigate]);

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    const updated = { ...selections, [positionId]: candidateId };
    setSelections(updated);
    sessionStorage.setItem('ug_ballot_selections', JSON.stringify(updated));

    // Clear missing position error if present
    if (missingPositions.includes(positionId)) {
      setMissingPositions(missingPositions.filter((p) => p !== positionId));
    }
  };

  const handleProceedToReview = () => {
    const unselected: string[] = [];
    positions.forEach((pos) => {
      if (!selections[pos.id]) {
        unselected.push(pos.id);
      }
    });

    if (unselected.length > 0) {
      setMissingPositions(unselected);
      addToast(
        `Please select a candidate for all contested positions (${unselected.length} remaining).`,
        'warning',
        'Incomplete Ballot'
      );
      // Smooth scroll to first missing
      const firstEl = document.getElementById(`ballot-position-${unselected[0]}`);
      firstEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    sessionStorage.setItem('ug_ballot_selections', JSON.stringify(selections));
    navigate('/vote/review');
  };

  if (loading) return <LoadingState message="Preparing your secure digital ballot..." />;

  const completedCount = Object.keys(selections).length;
  const totalPositions = positions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Voter Authentication Header Ribbon */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{voterSession?.voterName}</span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                ID: {voterSession?.voterId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verified Matriculated Voter • Single-ballot token active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">
            Progress: {completedCount} / {totalPositions} Selected
          </span>
        </div>
      </div>

      <PageHeader
        title="Official Digital Ballot Paper"
        description="Select your preferred candidate for each executive office. Click a candidate card to mark your choice."
      />

      {/* List of Ballot Positions */}
      <div className="space-y-6">
        {positions.map((pos) => {
          const isMissing = missingPositions.includes(pos.id);
          return (
            <div key={pos.id} className={isMissing ? 'ring-2 ring-red-500 rounded-2xl' : ''}>
              <BallotPosition
                position={pos}
                candidates={candidatesByPosition[pos.id] || []}
                selectedCandidateId={selections[pos.id]}
                onSelectCandidate={handleSelectCandidate}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-600 text-center sm:text-left">
          <span className="font-bold text-slate-900 block sm:inline">
            {completedCount === totalPositions
              ? 'All positions selected!'
              : `${totalPositions - completedCount} position(s) left to select`}
          </span>{' '}
          You will have an opportunity to review your complete ballot before final submission.
        </div>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleProceedToReview}
          className="w-full sm:w-auto shadow-md"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Review My Ballot Choices
        </Button>
      </div>
    </div>
  );
};
