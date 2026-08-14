import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UGCrest } from './UGCrest';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import {
  Vote,
  ShieldCheck,
  UserCheck,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, voterSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isCommissionerPath = location.pathname.startsWith('/commissioner');
  const isCandidatePath = location.pathname.startsWith('/candidate');
  const isVoterPath = location.pathname.startsWith('/vote');

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <UGCrest size="sm" />
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-amber-300 transition-colors">
                University of Ghana
              </span>
              <span className="text-[11px] text-amber-400 font-medium tracking-wide uppercase">
                Student Election System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/vote"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                isVoterPath
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Voter Portal</span>
            </Link>

            <Link
              to="/candidate/dashboard"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                isCandidatePath
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Candidate Portal</span>
            </Link>

            <Link
              to="/commissioner/dashboard"
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                isCommissionerPath
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Commissioner Portal</span>
            </Link>

            {/* Auth status controls */}
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-medium">
                    {user.role}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 p-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : voterSession ? (
              <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Voter: {voterSession.voterId}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link to="/vote">
                  <Button variant="secondary" size="sm">
                    Vote Now
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-2">
          <Link
            to="/vote"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            <Vote className="w-4 h-4 text-amber-400" />
            <span>Voter Portal (Cast Vote)</span>
          </Link>
          <Link
            to="/candidate/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>Candidate Portal</span>
          </Link>
          <Link
            to="/commissioner/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Commissioner Portal</span>
          </Link>
          {user && (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-amber-400">{user.role}</p>
              </div>
              <Button variant="danger" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
