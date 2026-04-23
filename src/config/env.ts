const fallbackApiUrl = 'http://localhost:8000/api/v1';
const fallbackCheckoutUrl = 'https://www.mercadopago.cl/checkout/v1/redirect';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export const env = {
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL ?? fallbackApiUrl),
  mercadoPagoCheckoutUrl: trimTrailingSlash(
    import.meta.env.VITE_MP_CHECKOUT_URL ?? fallbackCheckoutUrl
  ),
};
