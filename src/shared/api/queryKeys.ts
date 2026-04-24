export const queryKeys = {
  menu: ['menu'] as const,
  product: (id: number) => ['products', id] as const,
  productSearch: (query: string) => ['products', 'search', query] as const,
  promotions: ['promotions'] as const,
  myOrders: ['orders', 'my'] as const,
  order: (id: number) => ['orders', id] as const,
  orderPreview: (payload: unknown) => ['orders', 'preview', payload] as const,
  addresses: ['addresses'] as const,
  me: ['me'] as const,
  deliveryFee: (lat: number, lon: number) => ['delivery', lat, lon] as const,
};
