"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

export function LoginForm() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"login" | "registro">("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await register(regUsername, regPassword, regPassword2);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-bold text-dark">Inicia sesión</h1>
      <div className="mt-6 flex border-b border-border text-sm font-semibold">
        <button
          onClick={() => {
            setTab("login");
            setError("");
          }}
          className={cn(
            "flex-1 border-b-2 pb-3 text-center",
            tab === "login" ? "border-primary text-primary" : "border-transparent text-dark/40",
          )}
        >
          Login
        </button>
        <button
          onClick={() => {
            setTab("registro");
            setError("");
          }}
          className={cn(
            "flex-1 border-b-2 pb-3 text-center",
            tab === "registro" ? "border-primary text-primary" : "border-transparent text-dark/40",
          )}
        >
          Registro
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
          {error}
        </div>
      )}

      {tab === "login" ? (
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <Input
            id="username"
            label="Usuario"
            placeholder="Tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Checkbox id="remember" label="Recuérdame" />
          <Button type="submit" fullWidth loading={submitting}>
            Ingresar
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            className="gap-2 bg-white text-dark ring-1 ring-border"
          >
            <span className="h-3 w-3 rounded-full bg-blue-500" /> Continuar con Google
          </Button>
          <p className="text-center text-sm text-dark/50">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => {
                setTab("registro");
                setError("");
              }}
              className="font-semibold text-primary"
            >
              Regístrate
            </button>
          </p>
        </form>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleRegister}>
          <Input
            id="reg-username"
            label="Usuario"
            placeholder="Elige un usuario"
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            required
          />
          <Input
            id="reg-password"
            type="password"
            label="Contraseña"
            placeholder="Crea una contraseña"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            required
          />
          <Input
            id="reg-password2"
            type="password"
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={regPassword2}
            onChange={(e) => setRegPassword2(e.target.value)}
            required
          />
          <Button type="submit" fullWidth loading={submitting}>
            Crear cuenta
          </Button>
        </form>
      )}
    </div>
  );
}
