import pool from "./connection";

/** Best-effort: nunca debe romper el flujo de login/registro si falla. */
export async function logAuthEvent(
  userId: string | null,
  eventType: "LOGIN" | "REGISTER" | "LOGIN_FAILED",
  request: Request,
) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? null;
    const userAgent = request.headers.get("user-agent") ?? null;
    await pool.query(
      "INSERT INTO auth_logs (user_id, event_type, ip_address, user_agent) VALUES ($1, $2, $3, $4)",
      [userId, eventType, ip, userAgent],
    );
  } catch {
    // no-op: la auditoría no debe bloquear la autenticación
  }
}
