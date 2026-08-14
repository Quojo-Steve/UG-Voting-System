import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UGCrest } from '../../components/common/UGCrest';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Mail, Lock, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

export const CommissionerLogin: React.FC = () => {
  const [email, setEmail] = useState('commissioner@ug.edu.gh');
  const [password, setPassword] = useState('ecpassword2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { loginCommissioner } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/commissioner/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginCommissioner(email, password);
      addToast('Welcome to the Electoral Commissioner Portal', 'success', 'Login Successful');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid commissioner credentials or network error.');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Header Card */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <UGCrest size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Election Commissioner Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official University of Ghana Electoral Commission Sign-In
          </p>
        </div>

        {/* Login Form Card */}
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
                Official University Email
              </label>
              <Input
                type="email"
                required
                placeholder="commissioner@ug.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Commission Password
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
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Sign In to Commissioner Portal
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Credentials Pre-filled:</span>
              <span className="font-mono text-amber-300 font-semibold">
                commissioner@ug.edu.gh
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
