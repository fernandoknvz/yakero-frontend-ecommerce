import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/api/queryKeys';
import { menuApi } from '@/shared/api/services';

export function useMenu() {
  return useQuery({
    queryKey: queryKeys.menu,
    queryFn: menuApi.getFullMenu,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(productId: number) {
  return useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => menuApi.getProduct(productId),
    enabled: Number.isFinite(productId) && productId > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductSearch(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: queryKeys.productSearch(normalizedQuery),
    queryFn: () => menuApi.searchProducts(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
    staleTime: 60 * 1000,
  });
}

export function usePromotions() {
  return useQuery({
    queryKey: queryKeys.promotions,
    queryFn: menuApi.getPromotions,
    staleTime: 5 * 60 * 1000,
  });
}
