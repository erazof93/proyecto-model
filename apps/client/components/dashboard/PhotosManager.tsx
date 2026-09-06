"use client";

import { useState } from "react";
import { PhotoUploadZone } from "@/components/dashboard/PhotoUploadZone";
import { PhotoGallery } from "@/components/dashboard/PhotoGallery";
import type { ModelPhoto } from "@proyecto-model/types";

export function PhotosManager({ initialPhotos }: { initialPhotos: ModelPhoto[] }) {
  const [photos, setPhotos] = useState(initialPhotos);

  async function handleSetPrimary(photoId: string) {
    const res = await fetch(`/api/modelos/fotos/${photoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_primary: true }),
    });
    if (!res.ok) return;
    setPhotos((prev) => prev.map((p) => ({ ...p, is_primary: p.id === photoId })));
  }

  async function handleDelete(photoId: string) {
    const res = await fetch(`/api/modelos/fotos/${photoId}`, { method: "DELETE" });
    if (!res.ok) return;
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  return (
    <div className="space-y-6">
      <PhotoUploadZone onUploadSuccess={(photo) => setPhotos((prev) => [...prev, photo])} />
      <div>
        <h2 className="mb-4 text-lg font-bold text-dark">Galería ({photos.length})</h2>
        <PhotoGallery photos={photos} onSetPrimary={handleSetPrimary} onDelete={handleDelete} />
      </div>
    </div>
  );
}
