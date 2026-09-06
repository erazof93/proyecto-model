"use client";

import { useState } from "react";
import type { Model, ModelPhoto, ModelStatus } from "@proyecto-model/types";
import { ModeloDetailForm } from "@/components/admin/ModeloDetailForm";
import { PhotoApprovalCard } from "@/components/admin/PhotoApprovalCard";

export function ModeloDetailManager({
  modelo,
  initialPhotos,
}: {
  modelo: Model;
  initialPhotos: ModelPhoto[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);

  async function handleSaveProfile(data: {
    name: string;
    bio: string;
    is_verified: boolean;
    status: ModelStatus;
  }) {
    const res = await fetch(`/api/admin/modelos/${modelo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { error: err?.error ?? "Error al guardar" };
    }
    return {};
  }

  async function handleApprovePhoto(photoId: string) {
    const res = await fetch(`/api/admin/modelos/${modelo.id}/photos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action: "approve" }),
    });
    if (res.ok) {
      setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, is_verified: true } : p)));
    }
  }

  async function handleRejectPhoto(photoId: string) {
    const res = await fetch(`/api/admin/modelos/${modelo.id}/photos`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, action: "reject" }),
    });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    }
  }

  return (
    <div className="space-y-6">
      <ModeloDetailForm modelo={modelo} onSave={handleSaveProfile} />

      <div>
        <h2 className="mb-4 text-lg font-bold text-dark">Fotos ({photos.length})</h2>
        {photos.length === 0 ? (
          <p className="rounded-md bg-light_bg px-4 py-6 text-center text-dark/50">
            No hay fotos.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {photos.map((photo) => (
              <PhotoApprovalCard
                key={photo.id}
                photo={photo}
                onApprove={handleApprovePhoto}
                onReject={handleRejectPhoto}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
