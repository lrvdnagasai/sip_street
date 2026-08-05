import { create } from 'zustand';
import authService from '../services/authService';

export const LAST_USERNAME_KEY = 'c3_pos_last_username';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const userData = await authService.me();
      set({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(username, password);
      const user = data.user;

      // Remember username locally for pre-filling login
      if (user?.username) {
        localStorage.setItem(LAST_USERNAME_KEY, user.username);
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return user;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        'Login failed. Please check credentials or backend connection.';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch {
      // Ignore network/session errors during logout
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
