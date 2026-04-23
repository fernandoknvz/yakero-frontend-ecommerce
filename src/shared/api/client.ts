import axios, { AxiosError } from 'axios';

import { env } from '@/config/env';
import { emitAuthExpired } from '@/shared/lib/appEvents';
import { STORAGE_KEYS } from '@/shared/constants/storage';
import { useAuthStore } from '@/stores/authStore';
import type { ApiError } from '@/types';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      localStorage.removeItem(STORAGE_KEYS.auth);
      localStorage.removeItem(STORAGE_KEYS.token);
      emitAuthExpired();
    }

    return Promise.reject(error);
  }
);
