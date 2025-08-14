import axios from 'axios';
import { auth } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirecting to login');
      // You can dispatch a logout action here
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Auth endpoints
  register: (userData: { name: string; email: string; firebase_uid: string }) =>
    api.post('/auth/register', userData),
  
  getUserProfile: () => api.get('/user/profile'),
  
  getUserTransactions: (limit = 20, offset = 0) =>
    api.get(`/user/transactions?limit=${limit}&offset=${offset}`),
  
  // Credit management
  deductCredits: (data: { amount: number; service: string; description: string }) =>
    api.post('/credits/deduct', data),
  
  // Payment endpoints
  initiatePayment: (data: { amount: number; payment_method: string }) =>
    api.post('/payment/initiate', data),
  
  getPaymentStatus: (paymentId: string) =>
    api.get(`/payment/status/${paymentId}`),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;