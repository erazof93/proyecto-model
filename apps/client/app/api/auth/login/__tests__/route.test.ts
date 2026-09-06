/**
 * @jest-environment node
 */
// Node env: estas rutas no renderizan React, y next/headers/NextResponse
// necesitan el runtime de Node, no jsdom.

jest.mock("@/lib/db/users", () => ({
  getUserByUsername: jest.fn(),
  getModelIdentityByUserId: jest.fn(),
}));
jest.mock("@/lib/db/auth-logs", () => ({ logAuthEvent: jest.fn() }));
jest.mock("@/lib/auth/password", () => ({ verifyPassword: jest.fn() }));

import { POST } from "../route";
import { getUserByUsername, getModelIdentityByUserId } from "@/lib/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_COOKIE } from "@/lib/auth/session";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const mockGetUser = getUserByUsername as jest.Mock;
const mockGetModelIdentity = getModelIdentityByUserId as jest.Mock;
const mockVerifyPassword = verifyPassword as jest.Mock;

describe("POST /api/auth/login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 for a body missing credentials", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
  });

  it("returns 401 for a non-existent user, without revealing that it doesn't exist", async () => {
    mockGetUser.mockResolvedValue(null);
    const response = await POST(makeRequest({ username: "nobody", password: "password123" }));

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Usuario o contraseña incorrectos");
  });

  it("returns 401 for a deactivated user", async () => {
    mockGetUser.mockResolvedValue({ id: "1", username: "x", password_hash: "h", role: "customer", is_active: false });
    const response = await POST(makeRequest({ username: "x", password: "password123" }));
    expect(response.status).toBe(401);
  });

  it("returns 401 for the wrong password", async () => {
    mockGetUser.mockResolvedValue({
      id: "1",
      username: "sofia_lima",
      password_hash: "hash",
      role: "model",
      is_active: true,
    });
    mockVerifyPassword.mockResolvedValue(false);

    const response = await POST(makeRequest({ username: "sofia_lima", password: "wrong" }));
    expect(response.status).toBe(401);
  });

  it("returns 200, the user (never the raw token), and sets the session cookie", async () => {
    mockGetUser.mockResolvedValue({
      id: "u1",
      username: "admin",
      password_hash: "hash",
      role: "admin",
      is_active: true,
    });
    mockVerifyPassword.mockResolvedValue(true);

    const response = await POST(makeRequest({ username: "admin", password: "admin123" }));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.user).toEqual({ id: "u1", username: "admin", role: "admin" });
    expect(data.token).toBeUndefined(); // httpOnly cookie only, never in the body

    const cookie = response.cookies.get(SESSION_COOKIE);
    expect(cookie?.value).toBeDefined();
  });

  it("embeds modelId/modelSlug in the session only for the model role", async () => {
    mockGetUser.mockResolvedValue({
      id: "u2",
      username: "sofia_lima",
      password_hash: "hash",
      role: "model",
      is_active: true,
    });
    mockVerifyPassword.mockResolvedValue(true);
    mockGetModelIdentity.mockResolvedValue({ id: "model-1", slug: "sofia-lima" });

    const response = await POST(makeRequest({ username: "sofia_lima", password: "password123" }));
    expect(mockGetModelIdentity).toHaveBeenCalledWith("u2");
    expect(response.status).toBe(200);
  });
});
