import type { Address, AddressInput, User } from '@/types';

import { apiClient } from '../client';

export const usersApi = {
  updateProfile: (data: Partial<{ first_name: string; last_name: string; phone: string }>) =>
    apiClient.patch<User>('/users/me', data).then((response) => response.data),
  getAddresses: () => apiClient.get<Address[]>('/users/me/addresses').then((response) => response.data),
  addAddress: (data: AddressInput) =>
    apiClient.post<Address>('/users/me/addresses', data).then((response) => response.data),
  deleteAddress: (id: number) => apiClient.delete(`/users/me/addresses/${id}`),
};
