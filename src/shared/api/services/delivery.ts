import type { DeliveryFeeOut } from '@/types';

import { apiClient } from '../client';

export const deliveryApi = {
  getFee: (latitude: number, longitude: number) =>
    apiClient
      .post<DeliveryFeeOut>('/delivery/fee', { latitude, longitude })
      .then((response) => response.data),
};
