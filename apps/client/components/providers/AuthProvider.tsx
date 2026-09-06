"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth/types";

type ActionResult = { success: true } | { success: false; error: string };

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<ActionResult>;
  register: (username: string, password: string, confirmPassword: string) => Promise<ActionResult>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

async function parseError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  return data?.error || "Ocurrió un error inesperado";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setUser(data.user ?? null);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(
    async (username: string, password: string): Promise<ActionResult> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return { success: false, error: await parseError(res) };
      await refresh();
      return { success: true };
    },
    [refresh],
  );

  const register = useCallback(
    async (username: string, password: string, confirmPassword: string): Promise<ActionResult> => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirmPassword }),
      });
      if (!res.ok) return { success: false, error: await parseError(res) };
      await refresh();
      return { success: true };
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
