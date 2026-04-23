import type { Category, Product, Promotion } from '@/types';

import { apiClient } from '../client';

export const menuApi = {
  getFullMenu: () => apiClient.get<Category[]>('/categories/menu').then((response) => response.data),
  getProduct: (id: number) => apiClient.get<Product>(`/products/${id}`).then((response) => response.data),
  getPromotions: () => apiClient.get<Promotion[]>('/promotions/').then((response) => response.data),
  searchProducts: (query: string) =>
    apiClient.get<Product[]>('/products/', { params: { q: query } }).then((response) => response.data),
};
