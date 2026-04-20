import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, menuApi, ordersApi, usersApi, deliveryApi, couponsApi } from '../api/client';
import { useAuthStore } from '../../stores/authStore';
import type { RegisterInput, LoginInput, AddressInput, CreateOrderInput } from '../../types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const QK = {
  menu:      ['menu'] as const,
  promos:    ['promotions'] as const,
  myOrders:  ['orders', 'my'] as const,
  order:     (id: number) => ['orders', id] as const,
  addresses: ['addresses'] as const,
  me:        ['me'] as const,
  delivery:  (lat: number, lon: number) => ['delivery', lat, lon] as const,
};

// ─── Menu ─────────────────────────────────────────────────────────────────────
export function useMenu() {
  return useQuery({
    queryKey: QK.menu,
    queryFn: menuApi.getFullMenu,
    staleTime: 5 * 60 * 1000,   // 5 min — el menú no cambia frecuente
  });
}

export function usePromotions() {
  return useQuery({
    queryKey: QK.promos,
    queryFn: menuApi.getPromotions,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export function useRegister() {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: async (token) => {
      const user = await authApi.me();
      setAuth(token.access_token, user);
    },
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: async (token) => {
      const user = await authApi.me();
      setAuth(token.access_token, user);
      qc.invalidateQueries({ queryKey: QK.me });
    },
  });
}

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QK.me,
    queryFn: authApi.me,
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) => ordersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.myOrders });
    },
  });
}

export function useMyOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QK.myOrders,
    queryFn: () => ordersApi.getMyOrders(),
    enabled: isAuthenticated,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: QK.order(id),
    queryFn: () => ordersApi.getOrder(id),
    // Polling cada 15s para seguimiento del pedido
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      const terminal = ['entregado', 'cancelado', 'anulado'];
      return status && terminal.includes(status) ? false : 15_000;
    },
  });
}

// ─── Addresses ────────────────────────────────────────────────────────────────
export function useAddresses() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QK.addresses,
    queryFn: usersApi.getAddresses,
    enabled: isAuthenticated,
  });
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddressInput) => usersApi.addAddress(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.addresses }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.addresses }),
  });
}

// ─── Delivery ─────────────────────────────────────────────────────────────────
export function useDeliveryFee(lat?: number, lon?: number) {
  return useQuery({
    queryKey: QK.delivery(lat ?? 0, lon ?? 0),
    queryFn: () => deliveryApi.getFee(lat!, lon!),
    enabled: !!lat && !!lon,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Coupons ──────────────────────────────────────────────────────────────────
export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      couponsApi.validate(code, subtotal),
  });
}
