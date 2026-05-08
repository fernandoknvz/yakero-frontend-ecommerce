import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { paymentsApi } from '@/shared/api/services';
import type { CreatePaymentPreferenceInput } from '@/types';

export function useCreatePaymentPreference() {
  return useMutation({
    mutationFn: (data: CreatePaymentPreferenceInput) => paymentsApi.createPreference(data),
  });
}

export function usePaymentStatus(externalReference?: string | null) {
  return useQuery({
    enabled: Boolean(externalReference),
    queryKey: queryKeys.paymentStatus(externalReference ?? ''),
    queryFn: () => paymentsApi.getPaymentStatus(externalReference!),
    refetchInterval: (query) => {
      const status = query.state.data;

      if (!status) return 5000;
      if (status.order_id) return false;
      if (status.payment_status === 'rejected') return false;
      if (status.checkout_session_status === 'amount_mismatch') return false;
      if (
        status.checkout_session_status === 'failed' ||
        status.checkout_session_status === 'expired'
      ) {
        return false;
      }

      return 5000;
    },
  });
}
