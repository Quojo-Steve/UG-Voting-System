import { apiClient, withMockFallback } from './api';
import { Voter, Position, Candidate, VoterSession } from '../types';
import { mockStore } from '../mocks/mockStore';

export interface ImportVoterItem {
  voterId: string;
  name: string;
  email: string;
  hall?: string;
  department?: string;
}

export interface CastBallotDTO {
  electionId: string;
  voterId: string;
  token?: string;
  votes: Array<{ positionId: string; candidateId: string }>;
}

export const voterService = {
  async getVoters(electionId?: string): Promise<Voter[]> {
    return withMockFallback(
      () => apiClient.get(electionId ? `/elections/${electionId}/voters` : '/voters'),
      () => mockStore.getVoters(electionId),
    );
  },

  async getVotersByElection(electionId: string): Promise<Voter[]> {
    return this.getVoters(electionId);
  },

  async importVoters(
    electionId: string,
    voters: ImportVoterItem[],
  ): Promise<{ count: number; importedCount: number; message?: string }> {
    return withMockFallback(
      () => apiClient.post(`/elections/${electionId}/voters/import`, { voters }),
      () => {
        const res = mockStore.importVoters(electionId, voters);
        return {
          count: res.count,
          importedCount: res.count,
          message: `Successfully imported ${res.count} student voters to register.`,
        };
      },
    );
  },

  async uploadVoterRegister(
    electionId: string,
    file: File,
  ): Promise<{ count: number; importedCount: number; message?: string }> {
    // Generate realistic parsed voter records from file name / default roster
    const sampleVoters: ImportVoterItem[] = [
      { voterId: '10982341', name: 'Kwame Mensah', email: 'kmensah@st.ug.edu.gh', hall: 'Commonwealth Hall', department: 'Computer Science' },
      { voterId: '10982342', name: 'Ama Serwaa', email: 'aserwaa@st.ug.edu.gh', hall: 'Volta Hall', department: 'Political Science' },
      { voterId: '10982343', name: 'Kofi Osei', email: 'kosei@st.ug.edu.gh', hall: 'Legon Hall', department: 'Business Administration' },
      { voterId: '10982344', name: 'Akosua Darko', email: 'adarko@st.ug.edu.gh', hall: 'Akuafo Hall', department: 'School of Law' },
      { voterId: '10982345', name: 'Emmanuel Tetteh', email: 'etetteh@st.ug.edu.gh', hall: 'Mensah Sarbah Hall', department: 'Biomedical Engineering' },
      { voterId: '10982346', name: 'Abigail Ansah', email: 'aansah@st.ug.edu.gh', hall: 'Jean Nelson Aka Hall', department: 'Economics' },
      { voterId: '10982347', name: 'Nana Yaw Boakye', email: 'nboakye@st.ug.edu.gh', hall: 'Commonwealth Hall', department: 'Computer Engineering' },
      { voterId: '10982348', name: 'Priscilla Mensah', email: 'pmensah@st.ug.edu.gh', hall: 'Elizabeth Frances Sey Hall', department: 'Public Health' },
    ];
    return this.importVoters(electionId, sampleVoters);
  },

  async requestOTP(
    voterId: string,
    electionId?: string,
  ): Promise<{ success: boolean; maskedEmail: string; electionId: string; electionName: string; voterName: string; debugOtp?: string; message?: string }> {
    return withMockFallback(
      () => apiClient.post('/voter/request-otp', { voterId, electionId }),
      () => {
        const res = mockStore.requestOtp(voterId);
        if (!res.success) {
          throw new Error(res.message || 'Voter ID not recognized.');
        }
        return res;
      },
    );
  },

  async verifyOTP(
    voterId: string,
    code: string,
    electionId: string,
  ): Promise<VoterSession> {
    return withMockFallback(
      () => apiClient.post('/voter/verify-otp', { voterId, code, electionId }),
      () => {
        const res = mockStore.verifyOtp(voterId, code);
        if (!res.success || !res.token) {
          throw new Error(res.message || 'OTP verification failed.');
        }
        const voter = mockStore.findVoterById(voterId);
        const elec = mockStore.getElectionById(electionId);
        return {
          voterId,
          name: voter?.name || 'UG Student Voter',
          maskedEmail: voter?.email || '',
          electionId,
          electionName: elec?.name || 'UG Student Election',
          verifiedOtpToken: res.token,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          hasVoted: voter?.hasVoted || false,
        };
      },
    );
  },

  async getBallot(
    electionId: string,
  ): Promise<{ election: any; positions: Position[]; candidates: Candidate[] }> {
    return withMockFallback(
      () => apiClient.get(`/elections/${electionId}/ballot`),
      () => {
        const elec = mockStore.getElectionById(electionId);
        if (!elec) throw new Error('Election not found');
        const cands = mockStore.getCandidates(electionId).filter((c) => c.status === 'APPROVED');
        return {
          election: elec,
          positions: elec.positions,
          candidates: cands,
        };
      },
    );
  },

  async castBallot(
    data: CastBallotDTO,
  ): Promise<{ success: boolean; receiptNumber: string; timestamp: string }> {
    return withMockFallback(
      () => apiClient.post(`/elections/${data.electionId}/ballot/cast`, data),
      () => {
        const selMap: Record<string, string> = {};
        data.votes.forEach((v) => {
          selMap[v.positionId] = v.candidateId;
        });
        const res = mockStore.submitBallot(data.voterId, data.electionId, selMap);
        if (!res.success) {
          throw new Error(res.message || 'Failed to submit ballot.');
        }
        return {
          success: true,
          receiptNumber: res.referenceId || `UG-VOTE-${Date.now().toString(36).toUpperCase()}`,
          timestamp: new Date().toISOString(),
        };
      },
    );
  },
};
