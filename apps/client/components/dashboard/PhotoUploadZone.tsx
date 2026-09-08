"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ModelPhoto } from "@proyecto-model/types";

const ACCEPTED = "image/jpeg,image/png,image/webp";

export function PhotoUploadZone({
  onUploadSuccess,
}: {
  onUploadSuccess: (photo: ModelPhoto) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite re-subir el mismo archivo
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/modelos/fotos", { method: "POST", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? "Error al subir la foto");
      }
      onUploadSuccess(data.photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la foto");
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
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-white p-10 text-center text-dark/50">
        <UploadCloud className="h-8 w-8" />
        <p className="text-xs">JPG, PNG o WebP · máx. 10MB</p>
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          loading={uploading}
        >
          Subir foto
        </Button>
      </div>
    </div>
  );
}
