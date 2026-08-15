import { apiClient, withMockFallback } from './api';
import { BallotSelection, Election } from '../types';
import { mockStore } from '../mocks/mockStore';

export interface RequestOtpResponse {
  success: boolean;
  maskedEmail: string;
  electionId: string;
  electionName: string;
  voterName: string;
  debugOtp?: string;
  message?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface SubmitVoteResponse {
  success: boolean;
  referenceId?: string;
  message?: string;
}

export const votingService = {
  async requestOtp(voterId: string): Promise<RequestOtpResponse> {
    return withMockFallback(
      () => apiClient.post('/voting/request-otp', { voterId }),
      () => {
        const res = mockStore.requestOtp(voterId);
        if (!res.success) {
          throw new Error(res.message || 'Unable to request OTP for this voter ID.');
        }
        return res;
      },
    );
  },

  async verifyOtp(voterId: string, otp: string): Promise<VerifyOtpResponse> {
    return withMockFallback(
      () => apiClient.post('/voting/verify-otp', { voterId, otp }),
      () => {
        const res = mockStore.verifyOtp(voterId, otp);
        if (!res.success) {
          throw new Error(res.message || 'OTP verification failed.');
        }
        return res;
      },
    );
  },

  async getBallotData(electionId: string): Promise<Election> {
    return withMockFallback(
      () => apiClient.get(`/voting/ballot/${electionId}`),
      () => {
        const election = mockStore.getElectionById(electionId);
        if (!election) throw new Error('Election not found');
        return election;
      },
    );
  },

  async submitVote(
    voterId: string,
    electionId: string,
    selections: BallotSelection,
  ): Promise<SubmitVoteResponse> {
    return withMockFallback(
      () => apiClient.post('/voting/submit', { voterId, electionId, selections }),
      () => {
        const res = mockStore.submitBallot(voterId, electionId, selections);
        if (!res.success) {
          throw new Error(res.message || 'Failed to submit ballot.');
        }
        return res;
      },
    );
  },
};
