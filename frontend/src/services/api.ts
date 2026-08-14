import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 8000,
});

// Request interceptor for injecting auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ug_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // If backend is not reached (e.g. ECONNREFUSED), we handle it gracefully in services
    return Promise.reject(error);
  },
);

/**
 * Utility wrapper that attempts the real Axios call first,
 * and seamlessly falls back to mock logic if the backend is unreachable.
 */
export async function withMockFallback<T>(
  apiCall: () => Promise<AxiosResponse<T>>,
  mockFallback: () => T | Promise<T>,
  delayMs = 250,
): Promise<T> {
  try {
    const res = await apiCall();
    return res.data;
  } catch {
    // Artificial slight network delay for realistic UX loading states in prototype
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return await mockFallback();
  }
}

export default apiClient;
