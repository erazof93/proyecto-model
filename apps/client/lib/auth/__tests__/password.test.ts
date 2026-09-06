import { hashPassword, verifyPassword } from "../password";

describe("password hashing", () => {
  it("hashes a password to something other than the plaintext", async () => {
    const hash = await hashPassword("testPassword123");
    expect(hash).toBeDefined();
    expect(hash).not.toBe("testPassword123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies a correct password against its own hash", async () => {
    const hash = await hashPassword("correctPassword123");
    await expect(verifyPassword("correctPassword123", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correctPassword123");
    await expect(verifyPassword("wrongPassword456", hash)).resolves.toBe(false);
  });

  it("produces a standard bcrypt hash ($2a$/$2b$ prefix)", async () => {
    // El formato del hash importa: 002_seed_data.sql siembra contraseñas con
    // pgcrypto's crypt(pw, gen_salt('bf')), que produce hashes bcrypt
    // estándar. Si hashPassword dejara de usar bcrypt, esos usuarios
    // sembrados quedarían con hashes en un formato distinto e
    // irreconciliable sin re-sembrar la base de datos.
    const hash = await hashPassword("anyPassword123");
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
  });
});
