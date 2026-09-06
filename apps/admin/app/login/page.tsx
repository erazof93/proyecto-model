"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Flower2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-light_bg px-6">
      <div className="w-full max-w-sm rounded-md bg-white p-8 shadow-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-primary">
          <Flower2 className="h-6 w-6" /> Models <span className="font-normal text-dark/50">Admin</span>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="username"
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            id="password"
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth loading={submitting}>
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
}
