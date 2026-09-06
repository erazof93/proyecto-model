import { NextResponse } from "next/server";
import { Role } from "@proyecto-model/types";
import { createUser, usernameExists } from "@/lib/db/users";
import { logAuthEvent } from "@/lib/db/auth-logs";
import { hashPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const { username, password } = parsed.data;

  if (await usernameExists(username)) {
    return NextResponse.json({ error: "Ese usuario ya existe" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser(username, passwordHash, Role.CUSTOMER);
  await logAuthEvent(user.id, "REGISTER", request);

  const token = await signSession({ sub: user.id, username: user.username, role: user.role });

  const response = NextResponse.json({
    user: { id: user.id, username: user.username, role: user.role },
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
