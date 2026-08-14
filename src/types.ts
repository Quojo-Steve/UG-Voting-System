export type ElectionStatus =
  | 'DRAFT'
  | 'REGISTRATION'
  | 'READY'
  | 'LIVE'
  | 'CLOSED'
  | 'RESULTS_PUBLISHED';

export type CandidateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type VoterStatus = 'ELIGIBLE' | 'VOTED' | 'INVALID';

export interface Position {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface Candidate {
  id: string;
  electionId: string;
  positionId: string;
  positionName: string;
  fullName: string;
  email: string;
  studentId: string;
  hallOfResidence?: string;
  department?: string;
  level?: string;
  manifesto: string;
  runningMate?: string;
  avatarUrl?: string;
  status: CandidateStatus;
  appliedAt: string;
  reviewNotes?: string;
  votesCount?: number;
}

export interface Voter {
  id: string;
  voterId: string; // e.g. UG20260001 or 10892341
  name: string;
  email: string;
  electionId: string;
  hall?: string;
  department?: string;
  status: VoterStatus;
  hasVoted: boolean;
  votedAt?: string;
  importedAt: string;
}

export interface Election {
  id: string;
  name: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:MM
  status: ElectionStatus;
  positions: Position[];
  totalRegisteredVoters: number;
  totalVotesCast: number;
  createdAt: string;
  publishedAt?: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'ELECTION' | 'CANDIDATE' | 'VOTER' | 'RESULT' | 'SYSTEM';
}

export interface VoterSession {
  voterId: string;
  name: string;
  maskedEmail: string;
  electionId: string;
  electionName: string;
  verifiedOtpToken?: string;
  expiresAt?: string;
  hasVoted?: boolean;
}

export interface BallotSelection {
  [positionId: string]: string; // positionId -> candidateId
}

export interface CandidateResult {
  candidateId: string;
  candidateName: string;
  positionId: string;
  positionName: string;
  avatarUrl?: string;
  runningMate?: string;
  votes: number;
  percentage: number;
  rank: number;
  isWinner: boolean;
}

export interface PositionResult {
  positionId: string;
  positionName: string;
  totalVotes: number;
  candidates: CandidateResult[];
}

export interface ElectionResults {
  electionId: string;
  electionName: string;
  status: ElectionStatus;
  isPublished: boolean;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  turnoutPercentage: number;
  positions: PositionResult[];
  resultsByPosition: PositionResult[];
  publishedAt?: string;
}

export interface CommissionerUser {
  id: string;
  email: string;
  name: string;
  role: 'COMMISSIONER';
}

export interface CandidateUser {
  id: string;
  email: string;
  name: string;
  studentId: string;
  role: 'CANDIDATE';
}

export type User = CommissionerUser | CandidateUser;
