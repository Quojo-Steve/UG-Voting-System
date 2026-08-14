import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UGCrest } from '../../components/common/UGCrest';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import { voterService } from '../../services/voterService';
import { electionService } from '../../services/electionService';
import { Election } from '../../types';
import {
  GraduationCap,
  Vote,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const VoterIdEntry: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [studentId, setStudentId] = useState('10982341');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    electionService
      .getElections()
      .then((elecs) => {
        setElections(elecs);
        const live = elecs.find((e) => e.status === 'LIVE') || elecs[0];
        if (live) {
          setSelectedElectionId(live.id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentId.trim()) {
      setError('Please enter your valid University of Ghana Student ID.');
      return;
    }
    if (!selectedElectionId) {
      setError('Please select an active election.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await voterService.requestOTP(studentId.trim(), selectedElectionId);
      
      // Save pending voter info for next step
      sessionStorage.setItem('ug_pending_voter_id', studentId.trim());
      sessionStorage.setItem('ug_pending_election_id', selectedElectionId);
      sessionStorage.setItem('ug_pending_voter_email', response.maskedEmail || 'student email');

      addToast(
        response.message || `Verification OTP sent to ${response.maskedEmail}`,
        'success',
        'OTP Dispatched'
      );

      navigate('/vote/otp');
    } catch (err: any) {
      setError(err.message || 'Failed to verify Student ID or request OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const electionOptions = elections.map((e) => ({
    label: `${e.name} (${e.status})`,
    value: e.id,
  }));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to University Portal</span>
        </Link>

        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <UGCrest size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Electorate Identity Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Step 1 of 4: Verify your student matriculation credentials
          </p>
        </div>

        {/* Verification Form Card */}
        <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Active Student Election
              </label>
              <Select
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                options={electionOptions}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                University Student ID Number
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. 10982341"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                leftIcon={<GraduationCap className="w-4 h-4 text-slate-400" />}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500 font-mono"
                helperText="Enter the 8-digit Student ID on your student identity card."
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Two-Factor Authentication</span>
              </div>
              <p>
                A one-time passcode (OTP) will be dispatched to your registered University of Ghana
                student email.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                isLoading={isLoading}
                className="w-full justify-between"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Verification OTP
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Demo Test Voter ID:{' '}
              <span className="font-mono text-amber-300 font-bold">10982341</span> or{' '}
              <span className="font-mono text-amber-300 font-bold">10982342</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
