import { apiClient, withMockFallback } from './api';
import { Candidate, CandidateStatus } from '../types';
import { mockStore } from '../mocks/mockStore';

export interface ApplyCandidateDTO {
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
}

export const candidateService = {
  async getCandidates(electionId?: string): Promise<Candidate[]> {
    return withMockFallback(
      () => apiClient.get(electionId ? `/elections/${electionId}/candidates` : '/candidates'),
      () => mockStore.getCandidates(electionId),
    );
  },

  async getCandidatesByEmail(email: string): Promise<Candidate[]> {
    return withMockFallback(
      () => apiClient.get('/candidates/me', { params: { email } }),
      () => mockStore.getCandidatesByEmail(email),
    );
  },

  async getMyCandidateProfile(): Promise<Candidate | null> {
    return withMockFallback(
      () => apiClient.get('/candidates/me'),
      () => {
        const storedUser = localStorage.getItem('ug_auth_user');
        if (!storedUser) return null;
        try {
          const user = JSON.parse(storedUser);
          const list = mockStore.getCandidatesByEmail(user.email);
          return list.length > 0 ? list[0] : null;
        } catch {
          return null;
        }
      },
    );
  },

  async apply(data: ApplyCandidateDTO): Promise<Candidate> {
    return withMockFallback(
      () => apiClient.post(`/elections/${data.electionId}/candidates/apply`, data),
      () => mockStore.createCandidateApplication(data),
    );
  },

  async applyAsCandidate(data: ApplyCandidateDTO): Promise<Candidate> {
    return this.apply(data);
  },

  async approveCandidate(id: string): Promise<Candidate> {
    return withMockFallback(
      () => apiClient.patch(`/candidates/${id}/approve`),
      () => {
        const updated = mockStore.updateCandidateStatus(id, 'APPROVED');
        if (!updated) throw new Error('Candidate not found');
        return updated;
      },
    );
  },

  async rejectCandidate(id: string, reason?: string): Promise<Candidate> {
    return withMockFallback(
      () => apiClient.patch(`/candidates/${id}/reject`, { reason }),
      () => {
        const updated = mockStore.updateCandidateStatus(id, 'REJECTED', reason);
        if (!updated) throw new Error('Candidate not found');
        return updated;
      },
    );
  },

  async reviewCandidate(id: string, status: CandidateStatus, reason?: string): Promise<Candidate> {
    return withMockFallback(
      () => apiClient.patch(`/candidates/${id}/review`, { status, reason }),
      () => {
        const updated = mockStore.updateCandidateStatus(id, status, reason);
        if (!updated) throw new Error('Candidate not found');
        return updated;
      },
    );
  },
};
