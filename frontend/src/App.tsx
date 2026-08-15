import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts & Protected Routes
import { MainLayout } from './components/layout/MainLayout';
import { CommissionerLayout } from './components/layout/CommissionerLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Landing Page
import { LandingPage } from './pages/LandingPage';

// Commissioner Pages
import { CommissionerLogin } from './pages/commissioner/CommissionerLogin';
import { CommissionerDashboard } from './pages/commissioner/CommissionerDashboard';
import { CommissionerElections } from './pages/commissioner/CommissionerElections';
import { CommissionerCreateElection } from './pages/commissioner/CommissionerCreateElection';
import { CommissionerElectionDetails } from './pages/commissioner/CommissionerElectionDetails';
import { CommissionerVoters } from './pages/commissioner/CommissionerVoters';
import { CommissionerCandidates } from './pages/commissioner/CommissionerCandidates';
import { CommissionerResults } from './pages/commissioner/CommissionerResults';

// Candidate Pages
import { CandidateLogin } from './pages/candidate/CandidateLogin';
import { CandidateRegister } from './pages/candidate/CandidateRegister';
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { CandidateElections } from './pages/candidate/CandidateElections';
import { CandidateApply } from './pages/candidate/CandidateApply';
import { CandidateResults } from './pages/candidate/CandidateResults';

// Voter Flow Pages
import { VoterIdEntry } from './pages/voter/VoterIdEntry';
import { VoterOTP } from './pages/voter/VoterOTP';
import { VoterBallot } from './pages/voter/VoterBallot';
import { VoterReview } from './pages/voter/VoterReview';
import { VoterSuccess } from './pages/voter/VoterSuccess';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Voter Flow */}
            <Route path="/vote" element={<VoterIdEntry />} />
            <Route path="/vote/otp" element={<VoterOTP />} />
            <Route
              path="/vote/ballot"
              element={
                <ProtectedRoute allowedRole="VOTER">
                  <VoterBallot />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vote/review"
              element={
                <ProtectedRoute allowedRole="VOTER">
                  <VoterReview />
                </ProtectedRoute>
              }
            />
            <Route path="/vote/success" element={<VoterSuccess />} />

            {/* Candidate Portal */}
            <Route path="/candidate/login" element={<CandidateLogin />} />
            <Route path="/candidate/register" element={<CandidateRegister />} />
            <Route
              element={
                <ProtectedRoute allowedRole="CANDIDATE">
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/candidate" element={<Navigate to="/candidate/dashboard" replace />} />
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/candidate/elections" element={<CandidateElections />} />
              <Route path="/candidate/elections/:id/apply" element={<CandidateApply />} />
              <Route path="/candidate/results" element={<CandidateResults />} />
            </Route>

            {/* Commissioner Portal */}
            <Route path="/commissioner/login" element={<CommissionerLogin />} />
            <Route
              element={
                <ProtectedRoute allowedRole="COMMISSIONER">
                  <CommissionerLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="/commissioner"
                element={<Navigate to="/commissioner/dashboard" replace />}
              />
              <Route path="/commissioner/dashboard" element={<CommissionerDashboard />} />
              <Route path="/commissioner/elections" element={<CommissionerElections />} />
              <Route
                path="/commissioner/elections/create"
                element={<CommissionerCreateElection />}
              />
              <Route
                path="/commissioner/elections/:id"
                element={<CommissionerElectionDetails />}
              />
              <Route
                path="/commissioner/elections/:id/voters"
                element={<CommissionerVoters />}
              />
              <Route
                path="/commissioner/elections/:id/candidates"
                element={<CommissionerCandidates />}
              />
              <Route
                path="/commissioner/elections/:id/results"
                element={<CommissionerResults />}
              />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
