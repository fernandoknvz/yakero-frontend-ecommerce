import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AddressInput } from '@/types';

import { queryKeys } from '@/shared/api/queryKeys';
import { usersApi } from '@/shared/api/services';
import { useAuthStore } from '@/stores/authStore';

export function useAddresses() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.addresses,
    queryFn: usersApi.getAddresses,
    enabled: isAuthenticated,
  });
}

export function useAddAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddressInput) => usersApi.addAddress(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersApi.deleteAddress(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}
