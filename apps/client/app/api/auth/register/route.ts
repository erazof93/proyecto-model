import { NextResponse } from "next/server";
import { Role } from "@proyecto-model/types";
import { createUser, usernameExists } from "@/lib/db/users";
import { logAuthEvent } from "@/lib/db/auth-logs";
import { hashPassword } from "@/lib/auth/password";
import { signSession } from "@/lib/auth/jwt";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/session";

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "Usuario inválido (3-30 caracteres, sin espacios)" },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 },
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 });
  }

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
