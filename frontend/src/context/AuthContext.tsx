import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CommissionerUser, CandidateUser, VoterSession, BallotSelection } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: 'COMMISSIONER' | 'CANDIDATE' | 'VOTER' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginCommissioner: (email: string, pass: string) => Promise<void>;
  loginCandidate: (email: string, pass: string) => Promise<void>;
  registerCandidate: (data: {
    fullName: string;
    email: string;
    studentId: string;
    password: string;
    hallOfResidence?: string;
    department?: string;
    level?: string;
  }) => Promise<void>;
  logout: () => void;

  // Voter Temporary Session
  voterSession: VoterSession | null;
  setVoterSession: (session: VoterSession | null) => void;
  startVoterSession: (session: VoterSession) => void;
  endVoterSession: () => void;
  checkVoterSession: () => boolean;
  voterBallotSelection: BallotSelection;
  setVoterBallotSelection: React.Dispatch<React.SetStateAction<BallotSelection>>;
  clearVoterSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'ug_auth_user';
const TOKEN_STORAGE_KEY = 'ug_auth_token';
const VOTER_SESSION_KEY = 'ug_voter_temp_session';
const VOTER_SELECTIONS_KEY = 'ug_voter_temp_selections';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [voterSession, setVoterSessionState] = useState<VoterSession | null>(() => {
    try {
      const saved = sessionStorage.getItem(VOTER_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [voterBallotSelection, setVoterBallotSelection] = useState<BallotSelection>(() => {
    try {
      const saved = sessionStorage.getItem(VOTER_SELECTIONS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync voter ballot selections to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem(VOTER_SELECTIONS_KEY, JSON.stringify(voterBallotSelection));
    } catch (e) {
      console.warn('Failed to save ballot selections to sessionStorage', e);
    }
  }, [voterBallotSelection]);

  const setVoterSession = (session: VoterSession | null) => {
    setVoterSessionState(session);
    if (session) {
      sessionStorage.setItem(VOTER_SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(VOTER_SESSION_KEY);
    }
  };

  const clearVoterSession = () => {
    setVoterSessionState(null);
    setVoterBallotSelection({});
    sessionStorage.removeItem(VOTER_SESSION_KEY);
    sessionStorage.removeItem(VOTER_SELECTIONS_KEY);
  };

  const loginCommissioner = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authService.loginCommissioner(email, pass);
      setUser(res.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const loginCandidate = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authService.loginCandidate(email, pass);
      setUser(res.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const registerCandidate = async (data: {
    fullName: string;
    email: string;
    studentId: string;
    password: string;
    hallOfResidence?: string;
    department?: string;
    level?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await authService.registerCandidate(data);
      setUser(res.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const startVoterSession = (session: VoterSession) => setVoterSession(session);
  const endVoterSession = () => clearVoterSession();
  const checkVoterSession = () => {
    if (!voterSession) return false;
    if (voterSession.expiresAt && new Date(voterSession.expiresAt).getTime() <= Date.now()) {
      clearVoterSession();
      return false;
    }
    return true;
  };

  const role = voterSession ? 'VOTER' : user?.role || null;
  const isAuthenticated = !!user || !!voterSession;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        loginCommissioner,
        loginCandidate,
        registerCandidate,
        logout,
        voterSession,
        setVoterSession,
        startVoterSession,
        endVoterSession,
        checkVoterSession,
        voterBallotSelection,
        setVoterBallotSelection,
        clearVoterSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
