/**
 * Convierte un texto arbitrario en un slug apto para URLs.
 *
 * Pasos:
 *  1. lowercase
 *  2. normalize('NFD') + quitar diacríticos (tildes, ñ -> n)
 *  3. quitar caracteres no alfanuméricos
 *  4. espacios -> guiones, colapsar guiones repetidos
 *
 * @example generateSlug("Camila Pérez São") // "camila-perez-sao"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Igual que generateSlug pero añade un sufijo con los primeros 8 chars
 * de un id para garantizar unicidad.
 */
export function generateUniqueSlug(text: string, id: string): string {
  return `${generateSlug(text)}-${id.substring(0, 8)}`;
}
