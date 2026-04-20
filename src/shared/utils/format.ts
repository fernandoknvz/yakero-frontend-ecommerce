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
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Trunca un string a N caracteres con "…"
 */
export function truncate(str: string, n: number): string {
  return str.length > n ? `${str.slice(0, n)}…` : str;
}
