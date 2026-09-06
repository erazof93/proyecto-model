// ============================================================================
// @proyecto-model/config - Constantes y configuración compartida
// ============================================================================

export const SITE_NAME = "Marketplace de modelos";

/** Puertos de desarrollo de cada app. */
export const PORTS = {
  client: 3000,
  admin: 3001,
} as const;

/** Duraciones (en días) disponibles para destacados. */
export const FEATURED_DURATIONS = [7, 15, 30] as const;

/**
 * Usuario de Telegram del admin para contacto directo desde el dashboard de
 * modelo (destacados, dudas, etc). No vive en la tabla `users` -- es una
 * única cuenta de contacto a nivel de plataforma, no un dato por-usuario.
 */
export const ADMIN_TELEGRAM_USERNAME = "modelos_admin";
