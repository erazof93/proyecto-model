"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Model } from "@proyecto-model/types";

export function ProfileForm({ model }: { model: Model }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      age: Number(form.get("age")),
      gender: String(form.get("gender") ?? ""),
      bio: String(form.get("bio") ?? "") || undefined,
      whatsapp: String(form.get("whatsapp") ?? "") || undefined,
      instagram: String(form.get("instagram") ?? "") || undefined,
    };

    const res = await fetch("/api/modelos/perfil", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo guardar el perfil");
      return;
    }
    setSuccess(true);
  }

  return (
    <form className="max-w-xl space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-success-light px-4 py-3 text-sm text-success-dark">
          Perfil actualizado correctamente.
        </div>
      )}
      <Input id="name" name="name" label="Nombre" defaultValue={model.name} required />
      <div className="grid grid-cols-2 gap-4">
        <Input id="age" name="age" type="number" label="Edad" defaultValue={model.age} required />
        <Select id="gender" name="gender" label="Género" defaultValue={model.gender}>
          <option value="WOMAN">Mujer</option>
          <option value="MAN">Hombre</option>
          <option value="TRANSGENDER">Transexual</option>
        </Select>
      </div>
      <Textarea id="bio" name="bio" label="Bio" defaultValue={model.bio} maxLength={500} />
      <div className="grid grid-cols-2 gap-4">
        <Input id="whatsapp" name="whatsapp" label="WhatsApp" defaultValue={model.whatsapp} />
        <Input id="instagram" name="instagram" label="Instagram" defaultValue={model.instagram} />
      </div>
      <Button type="submit" fullWidth loading={submitting}>
        Guardar cambios
      </Button>
    </form>
  );
}
