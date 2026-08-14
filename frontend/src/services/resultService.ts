import { apiClient, withMockFallback } from './api';
import { ElectionResults } from '../types';
import { mockStore } from '../mocks/mockStore';

export const resultService = {
  async getElectionResults(electionId: string): Promise<ElectionResults> {
    return withMockFallback(
      () => apiClient.get(`/elections/${electionId}/results`),
      () => {
        const results = mockStore.getElectionResults(electionId);
        if (!results) throw new Error('Results for this election could not be calculated');
        return results;
      },
    );
  },

  async publishResults(electionId: string): Promise<ElectionResults> {
    return withMockFallback(
      () => apiClient.post(`/elections/${electionId}/publish-results`),
      () => {
        mockStore.updateElectionStatus(electionId, 'RESULTS_PUBLISHED');
        const results = mockStore.getElectionResults(electionId);
        if (!results) throw new Error('Failed to retrieve published results');
        return results;
      },
    );
  },

  async getCandidateResults(candidateEmail?: string): Promise<{
    publishedResults: ElectionResults[];
    unpublishedElections: { electionId: string; electionName: string }[];
  }> {
    return withMockFallback(
      () => apiClient.get('/candidates/me/results', { params: { email: candidateEmail } }),
      () => {
        const elections = mockStore.getElections();
        const published = elections
          .filter((e) => e.status === 'RESULTS_PUBLISHED')
          .map((e) => mockStore.getElectionResults(e.id)!)
          .filter(Boolean);

        const unpublished = elections
          .filter((e) => e.status !== 'RESULTS_PUBLISHED')
          .map((e) => ({ electionId: e.id, electionName: e.name }));

        return {
          publishedResults: published,
          unpublishedElections: unpublished,
        };
      },
    );
  },
};
