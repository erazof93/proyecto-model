"use client";

import { useState } from "react";
import { CldUploadWidget, type CldUploadWidgetResults } from "next-cloudinary";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ModelPhoto } from "@proyecto-model/types";

export function PhotoUploadZone({
  onUploadSuccess,
}: {
  onUploadSuccess: (photo: ModelPhoto) => void;
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(result: CldUploadWidgetResults) {
    setError("");
    if (!result.info || typeof result.info === "string") return;

    const info = result.info as { public_id: string; secure_url: string };
    const cloudinary_id = info.public_id;
    const cloudinary_url = info.secure_url;

    try {
      setUploading(true);
      const res = await fetch("/api/modelos/fotos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cloudinary_id, cloudinary_url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Error al guardar la foto");
      }
      const data = await res.json();
      onUploadSuccess(data.photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la foto");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-3 rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
          {error}
        </div>
      )}
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        onSuccess={handleUpload}
        onError={(err) => setError(typeof err === "string" ? err : "Error al subir la foto")}
      >
        {({ open }) => (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-white p-10 text-center text-dark/50 hover:border-primary hover:text-primary">
            <UploadCloud className="h-8 w-8" />
            <Button type="button" onClick={() => open()} loading={uploading}>
              Subir foto
            </Button>
          </label>
        )}
      </CldUploadWidget>
    </div>
  );
}
