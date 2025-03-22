import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  signup: async (email: string, password: string) => {
    const response = await api.post('/api/auth/signup', { email, password });
    return response.data;
  }
};

export const routesApi = {
  getAll: async () => {
    const response = await api.get('/api/routes');
    return response.data;
  }
};

export const stopsApi = {
  getAll: async () => {
    const response = await api.get('/api/stops');
    return response.data;
  }
};

export const bookingsApi = {
  getAll: async () => {
    const response = await api.get('/api/bookings');
    return response.data;
  },
  create: async (booking: any) => {
    const response = await api.post('/api/bookings', booking);
    return response.data;
  }
};

export const transferPointsApi = {
  getAll: async () => {
    const response = await api.get('/api/transfer-points');
    return response.data;
  }
};

export { api };