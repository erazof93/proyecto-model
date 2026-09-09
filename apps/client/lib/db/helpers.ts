const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** Hash entero estable de un string (variante de String.hashCode, con Math.imul
 *  para no desbordar a float). Mismo string → mismo número, siempre. */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(hash, 31) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Reordena de forma determinística por semana: dentro de una misma semana el
 * orden es fijo (el listado no "salta" entre requests) y cambia por completo al
 * pasar a la siguiente. Se hashea `id:semana`, así cada semana produce una
 * baraja nueva sin favorecer a ninguna modelo a largo plazo.
 */
export function applyWeeklyRotation<T extends { id: string }>(models: T[]): T[] {
  const week = Math.floor(Date.now() / WEEK_MS);
  // La semana va PRIMERO: al hashear se propaga por todo el string (avalancha),
  // así una semana a otra el orden cambia de verdad y no por un offset mínimo.
  return [...models].sort(
    (a, b) => hashCode(`${week}:${a.id}`) - hashCode(`${week}:${b.id}`),
  );
}

/**
 * Muestra determinística de `limit` elementos que ROTA cada hora: dentro de la
 * misma hora todos los usuarios (y todas las instancias serverless) ven la
 * misma selección; al pasar de hora cambia por completo. No necesita caché.
 */
export function hourlySample<T extends { id: string }>(items: T[], limit: number): T[] {
  const hour = Math.floor(Date.now() / HOUR_MS);
  return [...items]
    .sort((a, b) => hashCode(`${hour}:${a.id}`) - hashCode(`${hour}:${b.id}`))
    .slice(0, Math.max(0, limit));
}

/** Instante (epoch ms) en que `hourlySample` producirá una selección nueva. */
export function nextHourlyRefresh(): number {
  return (Math.floor(Date.now() / HOUR_MS) + 1) * HOUR_MS;
}
