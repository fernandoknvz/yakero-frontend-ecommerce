import type { Category, Product, Promotion } from '@/types';

import { apiClient } from '../client';

type ApiCollection<T> = T[] | { value?: T[]; items?: T[]; results?: T[]; data?: T[] };
type ApiCategory = Omit<Category, 'products'> & { products?: ApiProduct[] };
type ApiProduct = Omit<Product, 'price' | 'modifier_groups'> & {
  price: number | string;
  modifier_groups?: Product['modifier_groups'];
};

function unwrapCollection<T>(payload: ApiCollection<T>): T[] {
  if (Array.isArray(payload)) return payload;

  return payload.value ?? payload.items ?? payload.results ?? payload.data ?? [];
}

function toNumber(value: number | string | null | undefined) {
  const parsedValue = Number(value ?? 0);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function normalizeProduct(product: ApiProduct): Product {
  return {
    ...product,
    price: toNumber(product.price),
    modifier_groups: (product.modifier_groups ?? []).map((group) => ({
      ...group,
      options: group.options.map((option) => ({
        ...option,
        extra_price: toNumber(option.extra_price),
      })),
    })),
  };
}

function normalizeCategory(category: ApiCategory, products: Product[] = []): Category {
  return {
    ...category,
    image_url: category.image_url ?? undefined,
    products:
      category.products?.map((product) => normalizeProduct(product)) ??
      products.filter((product) => product.category_id === category.id),
  };
}

export const menuApi = {
  getCategories: () =>
    apiClient
      .get<ApiCollection<ApiCategory>>('/categories/')
      .then((response) => unwrapCollection(response.data)),
  getProducts: () =>
    apiClient
      .get<ApiCollection<ApiProduct>>('/products/')
      .then((response) =>
        unwrapCollection(response.data).map((product) => normalizeProduct(product))
      ),
  getFullMenu: async () => {
    const [categories, products] = await Promise.all([
      menuApi.getCategories(),
      menuApi.getProducts(),
    ]);
    return categories
      .map((category) => normalizeCategory(category, products))
      .sort((a, b) => a.sort_order - b.sort_order);
  },
  getProduct: (id: number) =>
    apiClient
      .get<ApiProduct>(`/products/${id}`)
      .then((response) => normalizeProduct(response.data)),
  getPromotions: () => apiClient.get<Promotion[]>('/promotions/').then((response) => response.data),
  searchProducts: (query: string) =>
    apiClient
      .get<ApiCollection<ApiProduct>>('/products/', { params: { q: query } })
      .then((response) =>
        unwrapCollection(response.data).map((product) => normalizeProduct(product))
      ),
};
