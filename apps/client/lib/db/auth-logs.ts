import { AuthLog } from "../entities/AuthLog";
import { getRepo } from "./data-source";

/** Best-effort: nunca debe romper el flujo de login/registro si falla. */
export async function logAuthEvent(
  userId: string | null,
  eventType: "LOGIN" | "REGISTER" | "LOGIN_FAILED",
  request: Request,
) {
  try {
    const repo = await getRepo(AuthLog);
    await repo.insert({
      user_id: userId,
      event_type: eventType,
      ip_address: request.headers.get("x-forwarded-for") ?? null,
      user_agent: request.headers.get("user-agent") ?? null,
    });
  } catch {
    // no-op: la auditoría no debe bloquear la autenticación
  }
}
