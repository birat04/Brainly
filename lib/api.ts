import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data: { email: string; password: string; username?: string }) =>
    apiClient.post('/signup', data),
  signin: (data: { email: string; password: string }) =>
    apiClient.post('/signin', data),
};

export const contentAPI = {
  getAll: () => apiClient.get('/content'),
  create: (data: { title: string; type: string; link?: string }) =>
    apiClient.post('/content', data),
  delete: (id: string) => apiClient.delete(`/content/${id}`),
};

export const brainAPI = {
  share: (data: { shareCode?: string; contentIds?: string[] }) =>
    apiClient.post('/brain/share', data),
  getShared: (shareId: string) =>
    apiClient.get(`/brain/${shareId}`),
};

export default apiClient;
