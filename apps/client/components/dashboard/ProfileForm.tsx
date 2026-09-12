"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Model } from "@proyecto-model/types";

type FormState = {
  name: string;
  age: string;
  gender: string;
  city: string;
  bio: string;
  height: string;
  weight: string;
  clothing_size: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  instagram: string;
  tiktok: string;
};

function toFormState(model: Model): FormState {
  return {
    name: model.name ?? "",
    age: String(model.age ?? ""),
    gender: model.gender ?? "WOMAN",
    city: model.city ?? "",
    bio: model.bio ?? "",
    height: model.height != null ? String(model.height) : "",
    weight: model.weight != null ? String(model.weight) : "",
    clothing_size: model.clothing_size ?? "",
    phone: model.phone ?? "",
    whatsapp: model.whatsapp ?? "",
    telegram: model.telegram ?? "",
    instagram: model.instagram ?? "",
    tiktok: model.tiktok ?? "",
  };
}

const GENDER_LABELS: Record<string, string> = {
  WOMAN: "Mujer",
  MAN: "Hombre",
  TRANSGENDER: "Transexual",
};

interface ProfileFormProps {
  model: Model;
  primaryPhotoUrl: string | null;
  servicesCount: number;
}

export function ProfileForm({ model, primaryPhotoUrl, servicesCount }: ProfileFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(model));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    const payload = {
      name: form.name,
      age: Number(form.age),
      gender: form.gender,
      city: form.city || undefined,
      bio: form.bio || undefined,
      height: form.height ? Number(form.height) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      clothing_size: form.clothing_size || undefined,
      phone: form.phone || undefined,
      whatsapp: form.whatsapp || undefined,
      telegram: form.telegram || undefined,
      instagram: form.instagram || undefined,
      tiktok: form.tiktok || undefined,
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-success-light px-4 py-3 text-sm text-success-dark">
            Perfil actualizado correctamente.
          </div>
        )}

        {/* Foto principal — la subida real vive en "Mis fotos" para pasar por
            aprobación de admin; aquí solo mostramos la actual. */}
        <section className="rounded-lg border border-border p-6">
          <h2 className="mb-4 text-lg font-bold text-dark">Foto principal</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-24 w-20 items-center justify-center overflow-hidden rounded-md bg-light_bg text-xs text-dark/40">
              {primaryPhotoUrl ? (
                <Image
                  src={primaryPhotoUrl}
                  alt="Foto principal"
                  width={80}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                "Sin foto"
              )}
            </div>
            <div className="text-sm text-dark/60">
              <p>Sube y organiza tus fotos (3:4) en la sección de fotos.</p>
              <Link href="/modelo/dashboard/fotos" className="font-semibold text-primary">
                Ir a Mis fotos →
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border p-6">
          <h2 className="mb-4 text-lg font-bold text-dark">Datos básicos</h2>
          <div className="space-y-4">
            <Input
              id="name"
              label="Nombre"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="age"
                type="number"
                label="Edad"
                min={18}
                max={99}
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                required
              />
              <Input
                id="city"
                label="Ciudad"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Lima"
              />
            </div>
            <Select
              id="gender"
              label="Género"
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="WOMAN">Mujer</option>
              <option value="MAN">Hombre</option>
              <option value="TRANSGENDER">Transexual</option>
            </Select>
            <div className="grid grid-cols-3 gap-4">
              <Input
                id="height"
                type="number"
                label="Altura (cm)"
                value={form.height}
                onChange={(e) => set("height", e.target.value)}
              />
              <Input
                id="weight"
                type="number"
                label="Peso (kg)"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
              />
              <Input
                id="clothing_size"
                label="Talla"
                value={form.clothing_size}
                onChange={(e) => set("clothing_size", e.target.value)}
              />
            </div>
            <div>
              <Textarea
                id="bio"
                label="Bio"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value.slice(0, 500))}
                maxLength={500}
              />
              <p className="mt-1 text-xs text-dark/40">{form.bio.length}/500</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border p-6">
          <h2 className="mb-4 text-lg font-bold text-dark">Redes sociales</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="phone"
              label="Teléfono"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <Input
              id="whatsapp"
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
            />
            <Input
              id="telegram"
              label="Telegram"
              value={form.telegram}
              onChange={(e) => set("telegram", e.target.value)}
            />
            <Input
              id="instagram"
              label="Instagram"
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
            />
            <Input
              id="tiktok"
              label="TikTok"
              value={form.tiktok}
              onChange={(e) => set("tiktok", e.target.value)}
            />
          </div>
        </section>

        {/* Servicios vive en su propia página (checklists administrados por
            el admin); aquí solo mostramos un resumen con acceso directo. */}
        <section className="rounded-lg border border-border p-6">
          <h2 className="mb-2 text-lg font-bold text-dark">Servicios</h2>
          <p className="text-sm text-dark/60">
            {servicesCount > 0
              ? `Tienes ${servicesCount} servicio(s) seleccionados.`
              : "Aún no seleccionas servicios."}{" "}
            <Link href="/modelo/dashboard/servicios" className="font-semibold text-primary">
              Editar servicios →
            </Link>
          </p>
        </section>

        <Button type="submit" fullWidth loading={submitting}>
          Guardar cambios
        </Button>
      </form>

      {/* Preview (desktop) */}
      <div className="hidden lg:block">
        <div className="sticky top-8 rounded-lg border border-border bg-light_bg p-6">
          <h2 className="mb-4 text-lg font-bold text-dark">Vista previa</h2>
          <div className="mb-4 aspect-[3/4] w-full overflow-hidden rounded-md bg-white">
            {primaryPhotoUrl ? (
              <Image
                src={primaryPhotoUrl}
                alt="Foto principal"
                width={280}
                height={373}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-dark/40">
                Sin foto
              </div>
            )}
          </div>
          <p className="font-bold text-dark">
            {form.name || "(Nombre)"}
            {form.age ? `, ${form.age}` : ""}
          </p>
          <p className="text-sm text-dark/60">
            {GENDER_LABELS[form.gender] ?? form.gender} · {form.city || "(Ciudad)"}
          </p>
          <p className="mt-3 whitespace-pre-line text-sm text-dark/70">
            {form.bio || "(Sin biografía)"}
          </p>
        </div>
      </div>
    </div>
  );
}
