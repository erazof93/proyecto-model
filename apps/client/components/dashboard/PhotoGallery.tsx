"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ModelPhoto } from "@proyecto-model/types";

export function PhotoGallery({
  photos,
  onSetPrimary,
  onDelete,
}: {
  photos: ModelPhoto[];
  onSetPrimary: (photoId: string) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (photos.length === 0) {
    return <p className="py-12 text-center text-dark/50">No hay fotos aún. ¡Sube tu primera foto!</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {photos.map((photo) => (
        <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md bg-light_bg">
          <Image
            src={photo.cloudinary_url}
            alt="Foto de la modelo"
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {photo.is_primary && <Badge variant="primary">⭐ Principal</Badge>}
            <Badge variant={photo.is_verified ? "success" : "warning"}>
              {photo.is_verified ? "Aprobada" : "Pendiente"}
            </Badge>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
            {!photo.is_primary && (
              <Button
                type="button"
                variant="secondary"
                className="flex-1 gap-1 bg-white/90 px-2 py-1.5 text-xs"
                disabled={busyId === photo.id}
                onClick={async () => {
                  setBusyId(photo.id);
                  await onSetPrimary(photo.id);
                  setBusyId(null);
                }}
              >
                <Star className="h-3 w-3" /> Principal
              </Button>
            )}
            <Button
              type="button"
              className="flex-1 gap-1 bg-danger px-2 py-1.5 text-xs hover:brightness-95"
              disabled={busyId === photo.id}
              onClick={async () => {
                if (!confirm("¿Eliminar esta foto?")) return;
                setBusyId(photo.id);
                await onDelete(photo.id);
                setBusyId(null);
              }}
            >
              <Trash2 className="h-3 w-3" /> {busyId === photo.id ? "..." : "Eliminar"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
