import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { STORAGE_KEYS } from '../shared/constants/storage';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        localStorage.setItem(STORAGE_KEYS.token, token);
        set({ token, user, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.token);
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEYS.auth,
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.isAuthenticated = Boolean(state.token);
      },
    }
  )
);
