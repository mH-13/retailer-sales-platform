import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { LoginRequest, LoginResponse } from '../types';
import { useAuthStore } from '../store/authStore';

/**
 * Authentication Hooks
 *
 * Custom hooks for login and logout using TanStack Query
 *
 * Why TanStack Query?
 * - Automatic loading/error states
 * - Built-in caching
 * - Handles race conditions
 * - Retry logic
 * - Much cleaner than manual useState/useEffect
 */

/**
 * useLogin Hook
 *
 * Handles login API call and updates auth store
 *
 * Usage:
 *   const { mutate: login, isPending, error } = useLogin();
 *
 *   login({ username: 'admin', password: 'password123' });
 */
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Save user and token to store (which also saves to localStorage)
      setAuth(data.user, data.access_token);
    },
  });
};

/**
 * useLogout Hook
 *
 * Clears authentication and redirects to login
 *
 * Usage:
 *   const { mutate: logout } = useLogout();
 *   logout();
 */
export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      // Could call backend logout endpoint here if needed
      // For now, just clear local state
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
    },
  });
};
