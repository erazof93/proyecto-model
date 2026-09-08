/**
 * @jest-environment node
 *
 * proxy.ts (el "middleware" de Next 16) es lo que hace que tras el logout una
 * cookie ausente/inválida NO pueda seguir viendo /modelo/*: redirige a /login.
 */

jest.mock("@/lib/auth/jwt", () => ({ verifySession: jest.fn() }));

import { NextRequest } from "next/server";
import { proxy } from "../proxy";
import { verifySession } from "@/lib/auth/jwt";

const mockVerify = verifySession as jest.Mock;

function request(path: string, sessionCookie?: string) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"));
  if (sessionCookie !== undefined) req.cookies.set("session", sessionCookie);
  return req;
}

const locationOf = (res: Response) => res.headers.get("location");
const isNext = (res: Response) => res.headers.get("x-middleware-next") === "1";

beforeEach(() => jest.clearAllMocks());

describe("proxy() sobre /modelo/*", () => {
  it("sin cookie -> redirige a /login (no llega a verificar nada)", async () => {
    const res = await proxy(request("/modelo/dashboard"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toMatch(/\/login$/);
    expect(mockVerify).not.toHaveBeenCalled();
  });

  it("cookie caducada/inválida -> redirige a /login", async () => {
    mockVerify.mockResolvedValue(null);
    const res = await proxy(request("/modelo/dashboard", "stale-token"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toMatch(/\/login$/);
  });

  it("sesión de rol distinto a model -> redirige a /login", async () => {
    mockVerify.mockResolvedValue({ sub: "1", role: "customer" });
    const res = await proxy(request("/modelo/dashboard", "token"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toMatch(/\/login$/);
  });

  it("sesión válida de model -> deja pasar", async () => {
    mockVerify.mockResolvedValue({ sub: "1", role: "model" });
    const res = await proxy(request("/modelo/dashboard", "token"));
    expect(isNext(res)).toBe(true);
  });
});

describe("proxy() sobre /login", () => {
  it("con sesión válida -> saca al usuario a la home", async () => {
    mockVerify.mockResolvedValue({ sub: "1", role: "model" });
    const res = await proxy(request("/login", "token"));
    expect(res.status).toBe(307);
    expect(locationOf(res)).toMatch(/\/$/);
  });

  it("sin sesión -> deja ver /login", async () => {
    const res = await proxy(request("/login"));
    expect(isNext(res)).toBe(true);
  });
});
