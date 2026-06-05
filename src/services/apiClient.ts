// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://customlogicinnovation.com/rudrabannataxiservices/api',
  // baseURL: 'http://localhost:8080/api',
  timeout: 30000,  // ✅ 30 seconds for image uploads
  // ✅ NO default Content-Type header - let browser set it
}); 

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // ✅ FormData ke liye Content-Type DELETE karo (browser khud set karega)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Auth token add karo
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;