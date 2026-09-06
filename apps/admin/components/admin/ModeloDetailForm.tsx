"use client";

import { useState } from "react";
import { ModelStatus, type Model } from "@proyecto-model/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";

export function ModeloDetailForm({
  modelo,
  onSave,
}: {
  modelo: Model;
  onSave: (data: { name: string; bio: string; is_verified: boolean; status: ModelStatus }) => Promise<{ error?: string }>;
}) {
  const [name, setName] = useState(modelo.name);
  const [bio, setBio] = useState(modelo.bio ?? "");
  const [isVerified, setIsVerified] = useState(modelo.is_verified);
  // "Activo" es un control de suspensión: PENDING/ACTIVE cuentan como activo, SUSPENDED no.
  const [isActive, setIsActive] = useState(modelo.status !== ModelStatus.SUSPENDED);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    name !== modelo.name ||
    bio !== (modelo.bio ?? "") ||
    isVerified !== modelo.is_verified ||
    isActive !== (modelo.status !== ModelStatus.SUSPENDED);

  async function handleSave() {
    setError("");
    setSuccess(false);
    setSaving(true);
    const status = isActive
      ? modelo.status === ModelStatus.SUSPENDED
        ? ModelStatus.ACTIVE
        : modelo.status
      : ModelStatus.SUSPENDED;
    const result = await onSave({ name, bio, is_verified: isVerified, status });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  function handleCancel() {
    setName(modelo.name);
    setBio(modelo.bio ?? "");
    setIsVerified(modelo.is_verified);
    setIsActive(modelo.status !== ModelStatus.SUSPENDED);
    setError("");
    setSuccess(false);
  }

  return (
    <div className="rounded-md bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 text-lg font-bold text-dark">Información del perfil</h2>

      {error && (
        <div className="mb-4 rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-success-light px-4 py-3 text-sm text-success-dark">
          Cambios guardados correctamente.
        </div>
      )}

      <div className="space-y-4">
        <Input id="username" label="Usuario (no editable)" value={modelo.username} disabled />
        <Input
          id="name"
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
        />
        <Textarea
          id="bio"
          label="Biografía"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={saving}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-dark">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                disabled={saving}
              />
              Verificado
            </label>
            {isVerified && (
              <Badge variant="success" className="mt-2">
                Verificado
              </Badge>
            )}
          </div>
          <div>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-dark">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={saving}
              />
              Activo
            </label>
            {!isActive && (
              <Badge variant="danger" className="mt-2">
                Suspendida
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={!hasChanges || saving} loading={saving}>
            Guardar cambios
          </Button>
          <Button variant="secondary" onClick={handleCancel} disabled={!hasChanges || saving}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
