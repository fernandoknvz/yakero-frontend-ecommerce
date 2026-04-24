import type { CreateOrderInput, OrderOut, OrderPreviewOut } from '@/types';

import { apiClient } from '../client';

type ApiOrderPreviewOut = Omit<
  OrderPreviewOut,
  'subtotal' | 'delivery_fee' | 'discount' | 'total' | 'points_to_use' | 'pricing' | 'items'
> & {
  points_to_use: number | string;
  subtotal: number | string;
  delivery_fee: number | string;
  discount: number | string;
  total: number | string;
  pricing?: {
    coupon_discount: number | string;
    points_discount: number | string;
  };
  items: Array<
    Omit<
      OrderPreviewOut['items'][number],
      'base_unit_price' | 'modifiers_total' | 'unit_price' | 'total_price'
    > & {
      base_unit_price: number | string;
      modifiers_total: number | string;
      unit_price: number | string;
      total_price: number | string;
    }
  >;
};

function toNumber(value: number | string | null | undefined) {
  const parsedValue = Number(value ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function normalizePreview(preview: ApiOrderPreviewOut): OrderPreviewOut {
  return {
    ...preview,
    points_to_use: toNumber(preview.points_to_use),
    subtotal: toNumber(preview.subtotal),
    delivery_fee: toNumber(preview.delivery_fee),
    discount: toNumber(preview.discount),
    total: toNumber(preview.total),
    pricing: preview.pricing
      ? {
          coupon_discount: toNumber(preview.pricing.coupon_discount),
          points_discount: toNumber(preview.pricing.points_discount),
        }
      : undefined,
    items: preview.items.map((item) => ({
      ...item,
      base_unit_price: toNumber(item.base_unit_price),
      modifiers_total: toNumber(item.modifiers_total),
      unit_price: toNumber(item.unit_price),
      total_price: toNumber(item.total_price),
    })),
  };
}

export const ordersApi = {
  preview: (data: CreateOrderInput) =>
    apiClient
      .post<ApiOrderPreviewOut>('/orders/preview', data)
      .then((response) => normalizePreview(response.data)),
  create: (data: CreateOrderInput) =>
    apiClient.post<OrderOut>('/orders/', data).then((response) => response.data),
  getMyOrders: (skip = 0, limit = 20) =>
    apiClient
      .get<OrderOut[]>('/orders/my', { params: { skip, limit } })
      .then((response) => response.data),
  getOrder: (id: number) =>
    apiClient.get<OrderOut>(`/orders/${id}`).then((response) => response.data),
};
