import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// Profile API
export const profileAPI = {
  createProfile: (data) => api.post('/profile', data),
  create: (data) => api.post('/profile', data),
  getProfile: () => api.get('/profile'),
  get: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  update: (data) => api.put('/profile', data),
  uploadProfilePicture: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadPicture: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMedicalHistory: () => api.get('/profile/medical-history'),
  updateMedicalHistory: (data) => api.put('/profile/medical-history', data),
  createMedicalHistory: (data) => api.put('/profile/medical-history', data),
};

// Detection API
export const detectionAPI = {
  uploadScan: (file, detectionType = 'KIDNEY_DISEASE') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('detectionType', detectionType);
    return api.post('/detection/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  upload: (file, detectionType = 'KIDNEY_DISEASE') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('detectionType', detectionType);
    return api.post('/detection/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getHistory: (params) => api.get('/detection/history', { params }),
  getById: (id) => api.get(`/detection/${id}`),
  getPreviousImages: (detectionType) => api.get('/detection/previous-images', { params: { detectionType } }),
  updateNotes: (id, userNotes) => api.put(`/detection/${id}/notes`, { userNotes }),
};

// Chat API
export const chatAPI = {
  sendMessage: (message) => api.post('/chat/message', { message }),
  getHistory: (params) => api.get('/chat/history', { params }),
  clearHistory: () => api.delete('/chat/history'),
};

// Dashboard API
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getStats: () => api.get('/dashboard/stats'),
  getRecentDetections: () => api.get('/dashboard/recent-detections'),
  getHealthTrends: () => api.get('/dashboard/health-trends'),
  getRiskScore: () => api.get('/dashboard/risk-score'),
  getTrends: (days) => api.get('/dashboard/trends', { params: { days } }),
};

// Health Logs API
export const healthLogAPI = {
  createLog: (data) => api.post('/health-logs', data),
  create: (data) => api.post('/health-logs', data),
  getLogs: (params) => api.get('/health-logs', { params }),
  getAll: (params) => api.get('/health-logs', { params }),
  getLatest: () => api.get('/health-logs/latest'),
  deleteLog: (id) => api.delete(`/health-logs/${id}`),
};

// Medications API
export const medicationAPI = {
  create: (data) => api.post('/medications', data),
  getAll: (isActive) => api.get('/medications', { params: { isActive } }),
  update: (id, data) => api.put(`/medications/${id}`, data),
  delete: (id) => api.delete(`/medications/${id}`),
};

export default api;
