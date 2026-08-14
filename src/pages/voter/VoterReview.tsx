import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { LoadingState } from '../../components/common/LoadingState';
import { voterService } from '../../services/voterService';
import { Position, Candidate } from '../../types';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  Vote,
  Award,
  User,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export const VoterReview: React.FC = () => {
  const { voterSession, endVoterSession } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [positions, setPositions] = useState<Position[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!voterSession) {
      navigate('/vote', { replace: true });
      return;
    }

    const saved = sessionStorage.getItem('ug_ballot_selections');
    if (!saved) {
      navigate('/vote/ballot', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setSelections(parsed);
    } catch (e) {
      navigate('/vote/ballot', { replace: true });
      return;
    }

    async function loadBallotSummary() {
      try {
        const ballotData = await voterService.getBallot(voterSession!.electionId);
        setPositions(ballotData.positions);
        setCandidates(ballotData.candidates);
      } catch (err: any) {
        addToast(err.message || 'Failed to load ballot data', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadBallotSummary();
  }, [voterSession, navigate]);

  const handleFinalSubmit = async () => {
    if (!voterSession) return;
    setIsSubmitting(true);

    const votesArray = Object.entries(selections).map(([positionId, candidateId]) => ({
      positionId,
      candidateId: String(candidateId),
    }));

    try {
      const receipt = await voterService.castBallot({
        electionId: voterSession.electionId,
        voterId: voterSession.voterId,
        token: voterSession.token,
        votes: votesArray,
      });

      // Save receipt in session for the success screen
      sessionStorage.setItem('ug_vote_receipt', JSON.stringify(receipt));
      sessionStorage.removeItem('ug_ballot_selections');

      // End voter session token
      endVoterSession();

      addToast('Your official ballot has been cast and recorded.', 'success', 'Vote Cast');
      navigate('/vote/success', { replace: true });
    } catch (err: any) {
      addToast(err.message || 'Failed to cast ballot. Token may have expired.', 'error', 'Error');
    } finally {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
    }
  };

  if (loading) return <LoadingState message="Compiling your ballot review summary..." />;

  const getCandidateForPosition = (posId: string) => {
    const candId = selections[posId];
    return candidates.find((c) => c.id === candId);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Review Your Ballot Selections"
        description="Verify your selected candidates before final confirmation. This action is irreversible."
        backTo="/vote/ballot"
        backLabel="Edit Selections"
      />

      {/* Security Warning Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold text-amber-950">Important Voting Notice</p>
          <p className="mt-0.5">
            Once you click <strong>"Confirm & Cast Final Ballot"</strong>, your vote will be
            anonymously cast into the digital ballot box and your voter authorization token will be
            permanently retired. You cannot change your choices or cast another ballot.
          </p>
        </div>
      </div>

      {/* Ballot Choices Summary Table */}
      <Card title="Official Ballot Paper Summary">
        <div className="divide-y divide-slate-100">
          {positions.map((pos) => {
            const cand = getCandidateForPosition(pos.id);
            return (
              <div
                key={pos.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                    Portfolio
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{pos.name}</h4>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 min-w-0 sm:min-w-[260px]">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center">
                    {cand?.avatarUrl ? (
                      <img
                        src={cand.avatarUrl}
                        alt={cand.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {cand?.fullName || 'No Selection'}
                    </span>
                    {cand?.runningMate && (
                      <span className="text-[11px] text-amber-800 block truncate">
                        Mate: {cand.runningMate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => navigate('/vote/ballot')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="w-full sm:w-auto"
        >
          Return to Edit Choices
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => setIsConfirmModalOpen(true)}
          leftIcon={<Vote className="w-4 h-4" />}
          className="w-full sm:w-auto shadow-md"
        >
          Confirm & Cast Official Ballot
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        title="Confirm Final Ballot Submission"
        message="Are you sure you want to submit this ballot? Your single-person voter token will be retired and your vote recorded anonymously."
        confirmText="Yes, Cast My Vote"
        variant="primary"
        isLoading={isSubmitting}
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};
