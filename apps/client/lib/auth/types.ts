import type { Role } from "@proyecto-model/types";

/** Payload embebido en el JWT de sesión (cookie httpOnly). */
export type SessionPayload = {
  sub: string; // user id
  username: string;
  role: Role;
  modelId?: string;
  modelSlug?: string;
};

export type SessionUser = SessionPayload;
