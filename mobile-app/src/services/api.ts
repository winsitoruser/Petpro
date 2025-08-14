import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Get API URL from environment variables or use default
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.petpro.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    // Get the token from secure storage
    const token = await SecureStore.getItemAsync('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and request hasn't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Attempt to refresh token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        // Store new tokens
        await SecureStore.setItemAsync('auth_token', response.data.token);
        await SecureStore.setItemAsync('refresh_token', response.data.refreshToken);
        
        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
        
        // Retry original request with new token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, logout user
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        await SecureStore.deleteItemAsync('user_data');
        
        // Return the original error
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
