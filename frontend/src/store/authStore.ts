import { create } from 'zustand';
import { User } from '../types';

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
   * This restores the user session if they refresh the page
   */
  initializeAuth: () => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');

    if (userStr && token) {
      try {
        const user = JSON.parse(userStr) as User;
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        // Invalid JSON in localStorage, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
  },
}));
