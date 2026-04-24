import { beforeEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/shared/constants/storage';

import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ accessToken: null, isAuthenticated: false, user: null });
  });

  it('stores auth token and marks user as authenticated', () => {
    useAuthStore.getState().setAuth('token-123', {
      created_at: '',
      email: 'yakero@example.com',
      first_name: 'Yak',
      id: 1,
      last_name: 'Ero',
      points_balance: 0,
      role: 'customer',
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.accessToken)).toBe('token-123');
  });

  it('clears auth state on logout', () => {
    useAuthStore.getState().setAuth('token-123', {
      created_at: '',
      email: 'yakero@example.com',
      first_name: 'Yak',
      id: 1,
      last_name: 'Ero',
      points_balance: 0,
      role: 'customer',
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.accessToken)).toBeNull();
  });
});
