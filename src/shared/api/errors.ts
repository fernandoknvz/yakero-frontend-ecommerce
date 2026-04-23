import { AxiosError } from 'axios';

import type { ApiError } from '@/types';

const FALLBACK_ERROR_MESSAGE = 'No pudimos completar la solicitud. Intenta nuevamente.';

export function getApiErrorMessage(error: unknown, fallback = FALLBACK_ERROR_MESSAGE) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return error instanceof AxiosError;
}
