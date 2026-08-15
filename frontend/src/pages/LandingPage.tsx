import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UGCrest } from '../components/common/UGCrest';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { electionService } from '../services/electionService';
import { Election } from '../types';
import {
  Vote,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  Eye,
  FileCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    electionService
      .getElections()
      .then((data) => setElections(data))
      .catch((err) => console.error('Failed to load elections on landing', err))
      .finally(() => setLoading(false));
  }, []);

  const liveElection = elections.find((e) => e.status === 'LIVE');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner / University Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UGCrest size="md" showMotto />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/vote">
              <Button
                variant="secondary"
                size="sm"
                className="shadow-sm"
                leftIcon={<Vote className="w-4 h-4" />}
              >
                Cast Your Vote
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full flex flex-col justify-center">
        {/* Live Banner if active */}
        {liveElection && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Active Election In Session
                  </span>
                  <StatusBadge status="LIVE" size="sm" />
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  {liveElection.name}
                </h2>
              </div>
            </div>
            <Link to="/vote">
              <Button
                variant="success"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Vote in Active Election
              </Button>
            </Link>
          </div>
        )}

        {/* Central University Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-4">
            Official Electoral Commission Portal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-serif">
            University of Ghana
            <span className="block text-2xl sm:text-3xl font-sans font-bold text-amber-400 mt-2">
              Student Election Management System
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Secure, transparent and accessible digital voting for University of Ghana student
            elections.
          </p>
        </div>

        {/* Three Portal Entry Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {/* 1. Voter / Electorate */}
          <div className="bg-slate-900/80 rounded-2xl border-2 border-amber-500/40 p-6 flex flex-col justify-between hover:border-amber-500 transition-all group relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
                <Vote className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white">Electorate</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Students
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Verify your student identity using your Voter ID & secure OTP to participate in an
                active election.
              </p>
            </div>
            <Link to="/vote" className="w-full block">
              <Button
                variant="secondary"
                size="md"
                className="w-full justify-between cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Vote
              </Button>
            </Link>
          </div>

          {/* 2. Candidate */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-sky-400 flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Candidate</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Register as a candidate for open portfolios, submit your manifesto, and monitor your
                election results.
              </p>
            </div>
            <Link to="/candidate/dashboard" className="w-full block">
              <Button
                variant="outline"
                size="md"
                className="w-full justify-between bg-slate-800 text-white border-slate-700 hover:bg-slate-700 cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Candidate Portal
              </Button>
            </Link>
          </div>

          {/* 3. Election Commissioner */}
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Election Commissioner</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Manage elections, upload verified voter registers, vet candidate applications, and
                publish certified results.
              </p>
            </div>
            <Link to="/commissioner/dashboard" className="w-full block">
              <Button
                variant="outline"
                size="md"
                className="w-full justify-between bg-slate-800 text-white border-slate-700 hover:bg-slate-700 cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Commissioner Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Security & Integrity Architecture Highlights */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 sm:p-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 text-center mb-6">
            Core Electoral Integrity Pillars
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-amber-400 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Secure Voter Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically tied OTP sent to registered student emails ensures only authorized
                  matriculated students vote.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 shrink-0 mt-0.5">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">One-Person-One-Vote</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict single-ballot enforcement and instantaneous token retirement prevent repeat
                  or duplicated voting.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-sky-400 shrink-0 mt-0.5">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Commissioner-Controlled</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Results remain private until officially audited and certified for publication by the
                  University Electoral Commission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} University of Ghana. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Electoral Commission</span>
            <span>•</span>
            <span>Academic Software Engineering Project</span>
            <span>•</span>
            <span className="font-mono text-amber-500">FastAPI API Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
