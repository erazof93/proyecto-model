import { Role } from "@proyecto-model/types";
import { Model } from "../entities/Model";
import { User } from "../entities/User";
import { getRepo } from "./data-source";

export type UserRow = {
  id: string;
  email: string | null;
  username: string;
  password_hash: string;
  role: Role;
  is_active: boolean;
};

export async function getUserByUsername(username: string): Promise<UserRow | null> {
  const repo = await getRepo(User);
  const user = await repo.findOne({
    where: { username },
    select: {
      id: true,
      email: true,
      username: true,
      password_hash: true,
      role: true,
      is_active: true,
    },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    password_hash: user.password_hash,
    role: user.role as Role,
    is_active: user.is_active,
  };
}

export async function usernameExists(username: string): Promise<boolean> {
  const repo = await getRepo(User);
  return repo.existsBy({ username });
}

export async function createUser(username: string, passwordHash: string, role: Role) {
  const repo = await getRepo(User);
  const saved = await repo.save(
    repo.create({ username, password_hash: passwordHash, role: role as User["role"] }),
  );
  return { id: saved.id, username: saved.username, role: saved.role as Role };
}

/** Para incrustar model_id/slug en el JWT cuando el usuario es una modelo. */
export async function getModelIdentityByUserId(
  userId: string,
): Promise<{ id: string; slug: string } | null> {
  const repo = await getRepo(Model);
  const model = await repo.findOne({
    where: { user_id: userId },
    select: { id: true, slug: true },
  });
  return model ? { id: model.id, slug: model.slug } : null;
}
