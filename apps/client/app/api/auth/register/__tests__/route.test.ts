/**
 * @jest-environment node
 */

jest.mock("@/lib/db/users", () => ({
  createUser: jest.fn(),
  usernameExists: jest.fn(),
}));
jest.mock("@/lib/db/auth-logs", () => ({ logAuthEvent: jest.fn() }));

import { POST } from "../route";
import { createUser, usernameExists } from "@/lib/db/users";
import { SESSION_COOKIE } from "@/lib/auth/session";

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const mockCreateUser = createUser as jest.Mock;
const mockUsernameExists = usernameExists as jest.Mock;

describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when the password is missing", async () => {
    const response = await POST(makeRequest({ username: "newuser123" }));
    expect(response.status).toBe(400);
  });

  it("returns 400 for a password shorter than 6 characters", async () => {
    const response = await POST(
      makeRequest({ username: "newuser123", password: "short", confirmPassword: "short" }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 for mismatched passwords", async () => {
    const response = await POST(
      makeRequest({ username: "newuser123", password: "password123", confirmPassword: "different" }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 400 for an invalid username format", async () => {
    const response = await POST(
      makeRequest({ username: "a b", password: "password123", confirmPassword: "password123" }),
    );
    expect(response.status).toBe(400);
  });

  it("returns 409 (not 400) for a duplicate username", async () => {
    mockUsernameExists.mockResolvedValue(true);
    const response = await POST(
      makeRequest({ username: "admin", password: "password123", confirmPassword: "password123" }),
    );
    expect(response.status).toBe(409);
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  it("defaults to role customer when none is supplied", async () => {
    mockUsernameExists.mockResolvedValue(false);
    mockCreateUser.mockResolvedValue({ id: "new-1", username: "new_user", role: "customer" });

    const response = await POST(
      makeRequest({ username: "new_user", password: "password123", confirmPassword: "password123" }),
    );

    expect(response.status).toBe(200);
    expect(mockCreateUser).toHaveBeenCalledWith("new_user", expect.any(String), "customer");

    const data = await response.json();
    expect(data.user.role).toBe("customer");
    expect(data.token).toBeUndefined();

    const cookie = response.cookies.get(SESSION_COOKIE);
    expect(cookie?.value).toBeDefined();
  });

  it.each(["model", "both"])("honors a self-selected role=%s (allowlisted)", async (role) => {
    mockUsernameExists.mockResolvedValue(false);
    mockCreateUser.mockResolvedValue({ id: "new-1", username: "new_user", role });

    const response = await POST(
      makeRequest({
        username: "new_user",
        password: "password123",
        confirmPassword: "password123",
        role,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockCreateUser).toHaveBeenCalledWith("new_user", expect.any(String), role);
  });

  it("ignores any role outside the allowlist — never lets a client self-assign admin", async () => {
    mockUsernameExists.mockResolvedValue(false);
    mockCreateUser.mockResolvedValue({ id: "new-1", username: "new_user", role: "customer" });

    const response = await POST(
      makeRequest({
        username: "new_user",
        password: "password123",
        confirmPassword: "password123",
        role: "admin", // intento de escalar privilegios: debe ser ignorado
      }),
    );

    expect(response.status).toBe(200);
    expect(mockCreateUser).toHaveBeenCalledWith("new_user", expect.any(String), "customer");

    const data = await response.json();
    expect(data.user.role).toBe("customer");
  });
});
