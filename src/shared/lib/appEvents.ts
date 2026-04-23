export const APP_EVENT_AUTH_EXPIRED = 'yakero:auth-expired';

export function emitAuthExpired() {
  window.dispatchEvent(new CustomEvent(APP_EVENT_AUTH_EXPIRED));
}
