import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
  STORAGE_KEYS,
} from '../shared/constants/storage';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string) => void;
  setAuth: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: getStoredAccessToken(),
      user: null,
      isAuthenticated: Boolean(getStoredAccessToken()),
      setAccessToken: (accessToken) => {
        setStoredAccessToken(accessToken);
        set({ accessToken, isAuthenticated: true });
      },
      setAuth: (accessToken, user) => {
        setStoredAccessToken(accessToken);
        set({ accessToken, user, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        clearStoredAccessToken();
        set({ accessToken: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEYS.auth,
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const accessToken = state.accessToken ?? getStoredAccessToken();
        if (accessToken) {
          setStoredAccessToken(accessToken);
        }
        state.accessToken = accessToken;
        state.isAuthenticated = Boolean(accessToken);
      },
    }
  )
);
