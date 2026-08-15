import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import { electionService } from '../../services/electionService';
import { candidateService } from '../../services/candidateService';
import { Election, Position } from '../../types';
import { Award, User, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export const CandidateApply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [runningMate, setRunningMate] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    electionService
      .getElectionById(id)
      .then((elec) => {
        setElection(elec);
        if (elec?.positions && elec.positions.length > 0) {
          setSelectedPositionId(elec.positions[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingState message="Loading nomination form..." />;

  const isRegistrationOpen = election?.status === 'REGISTRATION';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedPositionId) errs.position = 'Please select a portfolio to contest.';
    if (!manifesto.trim() || manifesto.trim().length < 20) {
      errs.manifesto = 'Please provide a detailed manifesto summary (at least 20 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !election || !user) return;

    setIsSubmitting(true);
    try {
      const posObj = election.positions.find((p) => p.id === selectedPositionId);
      await candidateService.applyAsCandidate({
        electionId: election.id,
        fullName: user.fullName,
        studentId: user.studentId || '10982341',
        email: user.email,
        positionId: selectedPositionId,
        positionName: posObj?.name || 'Executive Officer',
        runningMate: runningMate.trim() || undefined,
        manifesto: manifesto.trim(),
        hallOfResidence: user.hallOfResidence,
        department: user.department,
        level: user.level,
      });

      addToast(
        'Your candidate nomination papers have been filed successfully! Vetting status is now PENDING.',
        'success',
        'Application Submitted'
      );
      navigate('/candidate/dashboard');
    } catch (err: any) {
      addToast(err.message || 'Failed to file nomination papers.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionOptions =
    election?.positions.map((p) => ({
      label: p.name,
      value: p.id,
    })) || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title={`File Nomination — ${election?.name || 'Election'}`}
        description="Submit your nomination dossier and campaign manifesto to the University Electoral Commission."
        backTo="/candidate/elections"
        backLabel="Back to Elections"
      />

      {!isRegistrationOpen && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-bold">Registration Window Closed or Not Yet Open</p>
            <p className="mt-0.5">
              This election is currently in <strong>{election?.status}</strong> state. Official
              filings can only be processed when the status is REGISTRATION.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Aspirant Details */}
        <Card title="1. Aspirant Information" subtitle="Verified student credentials">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Candidate Full Name"
              value={user?.fullName || ''}
              disabled
              helperText="Tied to authenticated student record"
            />
            <Input
              label="Student ID Number"
              value={user?.studentId || '10982341'}
              disabled
              helperText="Verified matriculation ID"
            />
            <Input
              label="Hall of Residence"
              value={user?.hallOfResidence || 'Commonwealth Hall'}
              disabled
            />
            <Input
              label="Department / Level"
              value={`${user?.department || 'Computer Science'} • ${user?.level || 'Level 300'}`}
              disabled
            />
          </div>
        </Card>

        {/* Portfolio Selection */}
        <Card
          title="2. Portfolio & Nomination"
          subtitle="Choose the executive office you wish to contest"
        >
          <div className="space-y-4">
            <Select
              label="Contested Position / Portfolio"
              required
              value={selectedPositionId}
              onChange={(e) => setSelectedPositionId(e.target.value)}
              options={positionOptions}
              error={errors.position}
            />

            <Input
              label="Running Mate Full Name (Optional)"
              placeholder="e.g. Ama Serwaa (Required for Presidential tickets)"
              value={runningMate}
              onChange={(e) => setRunningMate(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              helperText="If contesting a joint ticket, enter your nominated vice candidate."
            />
          </div>
        </Card>

        {/* Manifesto & Platform */}
        <Card
          title="3. Campaign Manifesto & Policy Platform"
          subtitle="This manifesto will be published on digital ballot sheets for voters to review"
        >
          <div className="space-y-4">
            <Textarea
              label="Manifesto Summary & Key Objectives"
              required
              rows={6}
              placeholder="Outline your primary vision, governance platform, student welfare policies, and campaign promises..."
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              error={errors.manifesto}
              helperText="Minimum 20 characters. Express your core policy platform clearly."
            />
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/candidate/elections')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            isLoading={isSubmitting}
            disabled={!isRegistrationOpen}
            leftIcon={<Award className="w-4 h-4" />}
          >
            Submit Nomination Application
          </Button>
        </div>
      </form>
    </div>
  );
};
