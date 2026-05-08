export const APP_ROUTES = {
  home: '/',
  product: (productId: number | string) => `/productos/${productId}`,
  checkout: '/checkout',
  checkoutSuccess: '/checkout/success',
  checkoutFailure: '/checkout/failure',
  checkoutPending: '/checkout/pending',
  paymentStatusBase: '/payment/status',
  paymentStatus: (externalReference: string) => `/payment/status/${externalReference}`,
  login: '/login',
  register: '/register',
  account: '/account',
  accountOrders: '/account/orders',
} as const;
