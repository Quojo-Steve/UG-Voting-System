import { apiClient, withMockFallback } from './api';
import { CommissionerUser, CandidateUser, User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async loginCommissioner(email: string, password: string): Promise<LoginResponse> {
    return withMockFallback(
      () => apiClient.post('/auth/commissioner/login', { email, password }),
      () => {
        // Validate credentials in mock mode
        if (
          email.toLowerCase() === 'commissioner@ug.edu.gh' ||
          email.toLowerCase() === 'ec@ug.edu.gh' ||
          email.includes('commissioner') ||
          email.includes('admin')
        ) {
          const user: CommissionerUser = {
            id: 'comm-1',
            email: email.toLowerCase(),
            name: 'Prof. Kwesi Yankson (Electoral Commissioner)',
            role: 'COMMISSIONER',
          };
          const token = `token_comm_${Date.now()}`;
          return { token, user };
        } else if (password.length >= 6) {
          // Allow flexible commissioner login for testing
          const user: CommissionerUser = {
            id: 'comm-1',
            email: email.toLowerCase(),
            name: 'University Electoral Commissioner',
            role: 'COMMISSIONER',
          };
          return { token: `token_comm_${Date.now()}`, user };
        }
        throw new Error('Invalid commissioner email or password. Use commissioner@ug.edu.gh');
      },
    );
  },

  async loginCandidate(email: string, password: string): Promise<LoginResponse> {
    return withMockFallback(
      () => apiClient.post('/auth/candidate/login', { email, password }),
      () => {
        if (!email || !password) {
          throw new Error('Please provide email and password.');
        }
        const user: CandidateUser = {
          id: 'cand-user-1',
          email: email.toLowerCase(),
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          studentId: '10928374',
          role: 'CANDIDATE',
        };
        return { token: `token_cand_${Date.now()}`, user };
      },
    );
  },

  async registerCandidate(data: {
    fullName: string;
    email: string;
    studentId: string;
    password: string;
  }): Promise<LoginResponse> {
    return withMockFallback(
      () => apiClient.post('/auth/candidate/register', data),
      () => {
        if (!data.fullName || !data.email || !data.password) {
          throw new Error('All registration fields are required.');
        }
        const user: CandidateUser = {
          id: `cand-user-${Date.now()}`,
          email: data.email.toLowerCase(),
          name: data.fullName,
          studentId: data.studentId || '10999999',
          role: 'CANDIDATE',
        };
        return { token: `token_cand_${Date.now()}`, user };
      },
    );
  },
};
