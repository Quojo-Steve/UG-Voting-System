import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UGCrest } from '../../components/common/UGCrest';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Mail, Lock, UserCheck, ArrowLeft, KeyRound } from 'lucide-react';

export const CandidateLogin: React.FC = () => {
  const [email, setEmail] = useState('candidate@ug.edu.gh');
  const [password, setPassword] = useState('candidate2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { loginCandidate } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/candidate/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginCandidate(email, password);
      addToast('Welcome back to your Candidate Dashboard', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid candidate credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to University Portal</span>
        </Link>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <UGCrest size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Candidate Portal Sign-In
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your nomination filings, campaign manifesto, and election status
          </p>
        </div>

        <Card className="bg-slate-900 border-slate-800 text-white shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
                <span className="font-semibold shrink-0">Error:</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                UG Student / Candidate Email
              </label>
              <Input
                type="email"
                required
                placeholder="candidate@ug.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                leftIcon={<UserCheck className="w-4 h-4" />}
              >
                Sign In as Candidate
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Credentials:</span>
              <span className="font-mono text-amber-300 font-semibold">
                candidate@ug.edu.gh
              </span>
            </div>

            <p className="text-xs text-slate-400">
              New student aspirant?{' '}
              <Link to="/candidate/register" className="text-amber-400 hover:underline font-semibold">
                Create Candidate Account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
