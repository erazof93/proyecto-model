import { cookies } from "next/headers";
import { verifySession } from "./jwt";
import type { SessionPayload } from "./types";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días, debe coincidir con jwt.ts

/** Lee y verifica la sesión actual desde la cookie httpOnly (Server Components / Route Handlers). */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
