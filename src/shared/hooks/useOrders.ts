import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateOrderInput } from '@/types';

import { queryKeys } from '@/shared/api/queryKeys';
import { ordersApi } from '@/shared/api/services';
import { useAuthStore } from '@/stores/authStore';

const terminalStatuses = ['entregado', 'cancelado', 'anulado'];

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => ordersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
    },
  });
}

export function useMyOrders() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.myOrders,
    queryFn: () => ordersApi.getMyOrders(),
    enabled: isAuthenticated,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: Number.isFinite(id) && id > 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && terminalStatuses.includes(status) ? false : 15_000;
    },
  });
}
