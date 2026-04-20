import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, TokenResponse } from '../types';

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
        localStorage.setItem('yakero_token', token);
        set({ token, user, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      logout: () => {
        localStorage.removeItem('yakero_token');
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    { name: 'yakero_auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
