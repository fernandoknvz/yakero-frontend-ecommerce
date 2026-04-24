import axios, { AxiosError } from 'axios';

import { env } from '@/config/env';
import { emitAuthExpired } from '@/shared/lib/appEvents';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  STORAGE_KEYS,
} from '@/shared/constants/storage';
import { useAuthStore } from '@/stores/authStore';
import type { ApiError } from '@/types';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      localStorage.removeItem(STORAGE_KEYS.auth);
      clearStoredAccessToken();
      emitAuthExpired();
    }

    return Promise.reject(error);
  }
);
