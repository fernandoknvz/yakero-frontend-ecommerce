import type { CouponOut } from '@/types';

import { apiClient } from '../client';

export const couponsApi = {
  validate: (code: string, orderSubtotal: number) =>
    apiClient
      .post<CouponOut>('/coupons/validate', { code, order_subtotal: orderSubtotal })
      .then((response) => response.data),
};
