"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function BannerRequestForm({ onRequested }: { onRequested: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/banner-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "No se pudo enviar la solicitud");

      setTelegramUrl(data.telegramUrl ?? null);
      onRequested();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la solicitud");
    } finally {
      setSubmitting(false);
    }
  }

  if (telegramUrl) {
    return (
      <div className="rounded-md bg-light_bg p-6 text-center">
        <p className="mb-4 text-sm text-dark">
          ✅ Solicitud enviada. Contáctanos por Telegram para agilizar la revisión.
        </p>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-br from-primary to-accent px-7 py-3 text-sm font-semibold text-white transition hover:brightness-105"
        >
          <Send className="h-4 w-4" /> Contactar por Telegram
        </a>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">{error}</div>
      )}
      <Input
        id="banner-title"
        label="Título"
        placeholder="Ej. Promo de verano"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        id="banner-description"
        label="Descripción (opcional)"
        placeholder="Cuéntanos qué quieres destacar en tu banner"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <p className="text-sm text-dark/50">
        El admin revisará tu solicitud. Una vez aprobada, podrás subir la foto del banner (16:9)
        desde aquí mismo.
      </p>
      <Button type="submit" loading={submitting} disabled={!title.trim()}>
        Enviar solicitud
      </Button>
    </form>
  );
}
