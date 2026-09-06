import bcrypt from "bcryptjs";

// Compatible con los hashes sembrados por pgcrypto (crypt(pw, gen_salt('bf'))).
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
