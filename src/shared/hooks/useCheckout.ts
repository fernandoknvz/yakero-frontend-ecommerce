import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { couponsApi, deliveryApi } from '@/shared/api/services';

export function useDeliveryFee(lat?: number, lon?: number) {
  return useQuery({
    queryKey: queryKeys.deliveryFee(lat ?? 0, lon ?? 0),
    queryFn: () => deliveryApi.getFee(lat!, lon!),
    enabled: typeof lat === 'number' && typeof lon === 'number',
    staleTime: 2 * 60 * 1000,
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      couponsApi.validate(code, subtotal),
  });
}
