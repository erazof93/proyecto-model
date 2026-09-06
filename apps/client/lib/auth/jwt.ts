import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "./types";

// jose funciona en Edge runtime (a diferencia de jsonwebtoken/pg), por lo
// que este módulo es seguro de importar tanto desde Route Handlers como
// desde middleware.ts.
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");
const SESSION_DURATION = "7d";

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
