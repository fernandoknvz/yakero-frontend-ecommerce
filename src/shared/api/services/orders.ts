import type { CreateOrderInput, OrderOut } from '@/types';

import { apiClient } from '../client';

export const ordersApi = {
  create: (data: CreateOrderInput) =>
    apiClient.post<OrderOut>('/orders/', data).then((response) => response.data),
  getMyOrders: (skip = 0, limit = 20) =>
    apiClient
      .get<OrderOut[]>('/orders/my', { params: { skip, limit } })
      .then((response) => response.data),
  getOrder: (id: number) =>
    apiClient.get<OrderOut>(`/orders/${id}`).then((response) => response.data),
};
