import type {
  CreatePaymentPreferenceInput,
  PaymentPreferenceOut,
  PaymentStatusResponse,
} from '@/types';

import { apiClient } from '../client';

export const paymentsApi = {
  createPreference: (data: CreatePaymentPreferenceInput) =>
    apiClient
      .post<PaymentPreferenceOut>('/payments/create-preference', data)
      .then((response) => response.data),
  getPaymentStatus: (externalReference: string) =>
    apiClient
      .get<PaymentStatusResponse>(`/payments/status/${encodeURIComponent(externalReference)}`)
      .then((response) => response.data),
};
