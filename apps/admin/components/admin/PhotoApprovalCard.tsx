"use client";

import { useState } from "react";
import Image from "next/image";
import type { ModelPhoto } from "@proyecto-model/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function PhotoApprovalCard({
  photo,
  onApprove,
  onReject,
}: {
  photo: ModelPhoto;
  onApprove: (photoId: string) => Promise<void>;
  onReject: (photoId: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function handleApprove() {
    setBusy(true);
    await onApprove(photo.id);
    setBusy(false);
  }

  async function handleReject() {
    if (!confirm("¿Rechazar esta foto? Se eliminará.")) return;
    setBusy(true);
    await onReject(photo.id);
    setBusy(false);
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-md bg-light_bg">
        <Image src={photo.cloudinary_url} alt="Foto de la modelo" fill className="object-cover" />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          <Badge variant={photo.is_verified ? "success" : "warning"}>
            {photo.is_verified ? "Aprobada" : "Pendiente"}
          </Badge>
          {photo.is_primary && <Badge variant="neutral">⭐ Principal</Badge>}
        </div>
      </div>
      <p className="mt-2 text-xs text-dark/40">
        {new Date(photo.created_at).toLocaleDateString("es-PE")}
      </p>
      {!photo.is_verified && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="success"
            className="flex-1 px-3 py-1.5 text-xs"
            disabled={busy}
            onClick={handleApprove}
          >
            Aprobar
          </Button>
          <Button
            variant="danger"
            className="flex-1 px-3 py-1.5 text-xs"
            disabled={busy}
            onClick={handleReject}
          >
            Rechazar
          </Button>
        </div>
      )}
    </div>
  );
}
