import type { CreatePaymentPreferenceInput, PaymentPreferenceOut } from '@/types';

import { apiClient } from '../client';

export const paymentsApi = {
  createPreference: (data: CreatePaymentPreferenceInput) =>
    apiClient
      .post<PaymentPreferenceOut>('/payments/create-preference', data)
      .then((response) => response.data),
};
