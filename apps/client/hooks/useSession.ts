"use client";

import { useAuth } from "@/hooks/useAuth";

/** Alias de solo-lectura sobre useAuth, para componentes que solo necesitan la sesión. */
export function useSession() {
  const { user, loading } = useAuth();
  return { user, loading };
}
