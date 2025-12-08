import axios, { AxiosError } from 'axios';

/**
 * Axios API Client
 *
 * Configured HTTP client for calling the NestJS backend
 *
 * Features:
 * - Base URL configuration
 * - Automatic JWT token attachment
 * - Request/Response interceptors
 * - Error handling
 */

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Request Interceptor
 *
 * Automatically attaches JWT token to requests if it exists
 * The token is stored in localStorage after login
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 *
 * Handles common error scenarios:
 * - 401 Unauthorized: Clear token and redirect to login
 * - Network errors: Show user-friendly message
 */
api.interceptors.response.use(
  (response) => {
    // Success response - just return data
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized (invalid/expired token)
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      // Redirect to login (we'll implement routing later)
      window.location.href = '/login';
    }

    // Return error for component-level handling
    return Promise.reject(error);
  }
);

export default api;
