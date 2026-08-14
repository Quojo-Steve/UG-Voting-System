import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UGCrest } from '../../components/common/UGCrest';
import { OTPInput } from '../../components/common/OTPInput';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { voterService } from '../../services/voterService';
import { ArrowLeft, ArrowRight, RefreshCw, KeyRound, CheckCircle2, Lock } from 'lucide-react';

export const VoterOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(120);

  const { startVoterSession } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const voterId = sessionStorage.getItem('ug_pending_voter_id') || '';
  const electionId = sessionStorage.getItem('ug_pending_election_id') || '';
  const maskedEmail = sessionStorage.getItem('ug_pending_voter_email') || 'your student email';

  useEffect(() => {
    if (!voterId || !electionId) {
      navigate('/vote', { replace: true });
    }
  }, [voterId, electionId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp;
    setError(null);

    if (code.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      const session = await voterService.verifyOTP(voterId, code, electionId);
      startVoterSession(session);
      addToast('Identity verified. Loading your official ballot...', 'success', 'Voter Authenticated');
      navigate('/vote/ballot');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError(null);
    try {
      const response = await voterService.requestOTP(voterId, electionId);
      setCountdown(120);
      setOtp('');
      addToast(
        response.message || 'A fresh verification OTP has been dispatched.',
        'info',
        'OTP Resent'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const formatCountdown = () => {
    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-md">
        <Link
          to="/vote"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Voter ID</span>
        </Link>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <UGCrest size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enter Passcode</h1>
          <p className="text-xs text-slate-400 mt-1">
            Step 2 of 4: Enter the 6-digit passcode sent to{' '}
            <span className="text-amber-400 font-semibold">{maskedEmail}</span>
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl">
          <div className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                {error}
              </div>
            )}

            <div className="py-2">
              <OTPInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  setError(null);
                }}
                onComplete={(code) => handleVerify(code)}
                isError={Boolean(error)}
                disabled={isVerifying}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Expires in:</span>
                <span className="font-mono font-bold text-amber-400">{formatCountdown()}</span>
              </div>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0 || isResending}
                className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                  countdown > 0
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>Resend OTP</span>
              </button>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => handleVerify()}
              isLoading={isVerifying}
              disabled={otp.length !== 6}
              className="w-full justify-between"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Verify & Proceed to Ballot
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400">
              Demo OTP Hint: Use <span className="font-mono text-amber-300 font-bold">482910</span>{' '}
              to verify.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
