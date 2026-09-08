/**
 * @jest-environment node
 */
// Node env: NextResponse / next/headers necesitan el runtime de Node.

import { POST } from "../route";
import { SESSION_COOKIE } from "@/lib/auth/session";

describe("POST /api/auth/logout", () => {
  it("responde ok", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("borra la cookie de sesión: valor vacío y expiración inmediata", async () => {
    const res = await POST();
    const cookie = res.cookies.get(SESSION_COOKIE);

    expect(cookie).toBeDefined();
    expect(cookie?.value).toBe("");
    expect(cookie?.maxAge).toBe(0);
    expect(new Date(cookie!.expires!).getTime()).toBe(0); // epoch
  });

  it("repite los atributos del login para que el navegador identifique y elimine la misma cookie", async () => {
    const res = await POST();
    const cookie = res.cookies.get(SESSION_COOKIE);

    expect(cookie?.path).toBe("/");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("lax");
  });

  it("emite un header Set-Cookie con Max-Age=0", async () => {
    const res = await POST();
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(new RegExp(`${SESSION_COOKIE}=`));
    expect(setCookie).toMatch(/Max-Age=0/i);
  });
});
