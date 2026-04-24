const localDevApiBaseUrl = 'http://127.0.0.1:8000/api/v1';
const fallbackCheckoutUrl = 'https://www.mercadopago.cl/checkout/v1/redirect';

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function resolveApiBaseUrl() {
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredApiBaseUrl) {
    return trimTrailingSlash(configuredApiBaseUrl);
  }

  if (import.meta.env.PROD) {
    throw new Error(
      'Missing VITE_API_BASE_URL. Configure it in the deployment environment before building.'
    );
  }

  return localDevApiBaseUrl;
}

const API_BASE_URL = resolveApiBaseUrl();

if (import.meta.env.DEV || import.meta.env.PROD) {
  console.info('API base URL:', API_BASE_URL);
}

export const env = {
  apiUrl: API_BASE_URL,
  mercadoPagoCheckoutUrl: trimTrailingSlash(
    import.meta.env.VITE_MP_CHECKOUT_URL ?? fallbackCheckoutUrl
  ),
};
