"use client";

import { useEffect, useState } from "react";
import type { Checklist } from "@proyecto-model/types";
import { ChecklistSelector } from "@/components/dashboard/ChecklistSelector";
import { Button } from "@/components/ui/Button";

function sameIds(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((id, i) => id === sortedB[i]);
}

export function ServicesForm({
  checklists,
  initialSelectedIds,
  onSave,
}: {
  checklists: Checklist[];
  initialSelectedIds: string[];
  onSave: (ids: string[]) => Promise<{ error?: string }>;
}) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Tras un guardado exitoso, el padre actualiza initialSelectedIds; re-sincroniza
  // en vez de remontar (remontar perdería el setSuccess(true) que corre justo después).
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedIds]);

  const hasChanges = !sameIds(selectedIds, initialSelectedIds);

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    const result = await onSave(selectedIds);
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">{error}</div>
      )}
      {success && (
        <div className="rounded-md bg-success-light px-4 py-3 text-sm text-success-dark">
          Servicios actualizados correctamente.
        </div>
      )}

      <ChecklistSelector
        checklists={checklists}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        disabled={saving}
      />

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={!hasChanges || saving} loading={saving}>
          Guardar cambios
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={!hasChanges || saving}
          onClick={() => {
            setSelectedIds(initialSelectedIds);
            setError("");
            setSuccess(false);
          }}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
