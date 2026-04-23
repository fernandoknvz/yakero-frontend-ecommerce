export const queryKeys = {
  menu: ['menu'] as const,
  promotions: ['promotions'] as const,
  myOrders: ['orders', 'my'] as const,
  order: (id: number) => ['orders', id] as const,
  addresses: ['addresses'] as const,
  me: ['me'] as const,
  deliveryFee: (lat: number, lon: number) => ['delivery', lat, lon] as const,
};
