import { apiClient, withMockFallback } from './api';
import { Election, ElectionStatus, ActivityLog } from '../types';
import { mockStore } from '../mocks/mockStore';

export interface CreateElectionDTO {
  name: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  positions: string[]; // List of position names
}

export const electionService = {
  async getElections(): Promise<Election[]> {
    return withMockFallback(
      () => apiClient.get('/elections'),
      () => mockStore.getElections(),
    );
  },

  async getElectionById(id: string): Promise<Election> {
    return withMockFallback(
      () => apiClient.get(`/elections/${id}`),
      () => {
        const found = mockStore.getElectionById(id);
        if (!found) throw new Error('Election not found');
        return found;
      },
    );
  },

  async createElection(data: CreateElectionDTO): Promise<Election> {
    return withMockFallback(
      () => apiClient.post('/elections', data),
      () => {
        const newElection: Election = {
          id: `ele-${Date.now()}`,
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          startTime: data.startTime,
          endDate: data.endDate,
          endTime: data.endTime,
          status: 'DRAFT',
          positions: data.positions.map((name, index) => ({
            id: `pos-${Date.now()}-${index}`,
            name: name.trim(),
            order: index + 1,
          })),
          totalRegisteredVoters: 0,
          totalVotesCast: 0,
          createdAt: new Date().toISOString(),
        };
        return mockStore.saveElection(newElection);
      },
    );
  },

  async updateElectionStatus(id: string, status: ElectionStatus): Promise<Election> {
    return withMockFallback(
      () => apiClient.patch(`/elections/${id}/status`, { status }),
      () => {
        const updated = mockStore.updateElectionStatus(id, status);
        if (!updated) throw new Error('Failed to update election status');
        return updated;
      },
    );
  },

  async getActivityLogs(): Promise<ActivityLog[]> {
    return withMockFallback(
      () => apiClient.get('/activity-logs'),
      () => mockStore.getActivityLogs(),
    );
  },

  async getElectionResults(id: string): Promise<any> {
    return withMockFallback(
      () => apiClient.get(`/elections/${id}/results`),
      () => {
        const res = mockStore.getElectionResults(id);
        if (!res) throw new Error('Results not found for this election');
        return {
          ...res,
          positions: res.resultsByPosition,
        };
      },
    );
  },
};
