import { loginSchema, registerSchema } from "../validation";

describe("loginSchema", () => {
  it("accepts a valid username/password pair", () => {
    const result = loginSchema.safeParse({ username: "sofia_lima", password: "password123" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty username", () => {
    const result = loginSchema.safeParse({ username: "", password: "password123" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ username: "sofia_lima", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      username: "new_user",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a username with invalid characters", () => {
    const result = registerSchema.safeParse({
      username: "no spaces!",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a username shorter than 3 characters", () => {
    const result = registerSchema.safeParse({
      username: "ab",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      username: "new_user",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      username: "new_user",
      password: "password123",
      confirmPassword: "different456",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });
});
