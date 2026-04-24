export const APP_ROUTES = {
  home: '/',
  product: (productId: number | string) => `/productos/${productId}`,
  checkout: '/checkout',
  checkoutSuccess: '/checkout/success',
  checkoutFailure: '/checkout/failure',
  checkoutPending: '/checkout/pending',
  login: '/login',
  register: '/register',
  account: '/account',
  accountOrders: '/account/orders',
} as const;
