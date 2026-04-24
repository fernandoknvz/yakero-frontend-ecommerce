import { useMutation } from '@tanstack/react-query';

import type { CreatePaymentPreferenceInput } from '@/types';

import { paymentsApi } from '@/shared/api/services';

export function useCreatePaymentPreference() {
  return useMutation({
    mutationFn: (data: CreatePaymentPreferenceInput) => paymentsApi.createPreference(data),
  });
}
