import bcrypt from "bcryptjs";

// Compatible con los hashes sembrados por pgcrypto (crypt(pw, gen_salt('bf')))
// en 002_seed_data.sql: mismo formato bcrypt $2a$/$2b$.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
