"use client";

import { useState } from "react";
import type { Checklist } from "@proyecto-model/types";
import { ServicesForm } from "@/components/dashboard/ServicesForm";

export function ServicesManager({
  checklists,
  initialAssignedIds,
}: {
  checklists: Checklist[];
  initialAssignedIds: string[];
}) {
  const [assignedIds, setAssignedIds] = useState(initialAssignedIds);

  async function handleSave(ids: string[]) {
    const res = await fetch("/api/modelos/servicios", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklist_ids: ids }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { error: data?.error ?? "No se pudo guardar" };
    }
    const data = await res.json();
    setAssignedIds(data.assignedIds);
    return {};
  }

  return (
    <ServicesForm
      checklists={checklists}
      initialSelectedIds={assignedIds}
      onSave={handleSave}
    />
  );
}
