/**
 * Formatea un número como precio en pesos chilenos.
 * Ejemplo: 4990 → "$4.990"
 */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha ISO a formato legible en español.
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    timeZone: 'America/Santiago',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatDateTimeChile(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    timeZone: 'America/Santiago',
  }).format(new Date(iso));
}

/**
 * Trunca un string a N caracteres con "…"
 */
export function truncate(str: string, n: number): string {
  return str.length > n ? `${str.slice(0, n)}…` : str;
}
