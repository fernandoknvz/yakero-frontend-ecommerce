export const STORAGE_KEYS = {
  accessToken: 'yakero_access_token',
  auth: 'yakero_auth',
  cart: 'yakero_cart',
  legacyToken: 'yakero_token',
} as const;

export function getStoredAccessToken() {
  const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (accessToken) return accessToken;

  const legacyToken = localStorage.getItem(STORAGE_KEYS.legacyToken);
  if (legacyToken) {
    localStorage.setItem(STORAGE_KEYS.accessToken, legacyToken);
    localStorage.removeItem(STORAGE_KEYS.legacyToken);
  }

  return legacyToken;
}

export function setStoredAccessToken(accessToken: string) {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.removeItem(STORAGE_KEYS.legacyToken);
}

export function clearStoredAccessToken() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.legacyToken);
}
