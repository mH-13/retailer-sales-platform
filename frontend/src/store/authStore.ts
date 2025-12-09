import { create } from 'zustand';
import type { User } from '../types';

/**
 * Authentication Store (Zustand)
 *
 * Simple global state management for user authentication
 *
 * Why Zustand?
 * - Much simpler than Redux (no boilerplate!)
 * - Built-in TypeScript support
 * - Automatic re-renders when state changes
 * - Works with hooks
 *
 * Usage in components:
 *   const { user, setUser, logout } = useAuthStore();
 */

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  /**
   * Set user and token after login
   *
   * Also persists to localStorage so user stays logged in after page refresh
   */
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('access_token', token);

    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  /**
   * Clear authentication and redirect to login
   */
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    // Redirect to login page
    window.location.href = '/login';
  },

  /**
   * Initialize auth from localStorage on app startup
   *
   * This validates the token with the backend and restores the user session
   * If the token is invalid or expired, it clears the session
   */
  initializeAuth: async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      set({ isInitialized: true });
      return;
    }

    try {
      // Validate token by fetching user profile from backend
      const response = await fetch('http://localhost:3000/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        set({
          user,
          token,
          isAuthenticated: true,
          isInitialized: true,
        });
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // Token is invalid or expired, clear session
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        set({ isInitialized: true });
      }
    } catch (error) {
      // Network error or backend down, clear session
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
      set({ isInitialized: true });
    }
  },
}));
