import { Role } from "@proyecto-model/types";
import pool from "./connection";

export type UserRow = {
  id: string;
  email: string | null;
  username: string;
  password_hash: string;
  role: Role;
  is_active: boolean;
};

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    "SELECT id, email, username, password_hash, role, is_active FROM users WHERE username = $1",
    [username],
  );
  return result.rows[0] ?? null;
}

export async function usernameExists(username: string): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM users WHERE username = $1", [username]);
  return (result.rowCount ?? 0) > 0;
}

export async function createUser(username: string, passwordHash: string, role: Role) {
  const result = await pool.query<Pick<UserRow, "id" | "username" | "role">>(
    "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role",
    [username, passwordHash, role],
  );
  return result.rows[0];
}

/** Para incrustar model_id/slug en el JWT cuando el usuario es una modelo. */
export async function getModelIdentityByUserId(
  userId: string,
): Promise<{ id: string; slug: string } | null> {
  const result = await pool.query<{ id: string; slug: string }>(
    "SELECT id, slug FROM models WHERE user_id = $1",
    [userId],
  );
  return result.rows[0] ?? null;
}
