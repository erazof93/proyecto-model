"use client";

import { useRef, useState } from "react";
import ReactCrop, {
  type Crop,
  type PercentCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { UploadCloud, X } from "lucide-react";
import type { PhotoType } from "@proyecto-model/types";
import { Button } from "@/components/ui/Button";
import {
  MAX_PHOTOS,
  MAX_UPLOAD_BYTES,
  TARGET_ASPECT,
  needsManualCrop,
} from "@/lib/images/aspect";

const ACCEPT = "image/jpeg,image/png,image/webp";

type Item = {
  id: string;
  file: File;
  preview: string;
  naturalWidth: number;
  naturalHeight: number;
  /** La proporción no encaja: se ofrece recorte manual. */
  needsCrop: boolean;
  /** Recorte confirmado, en % de la imagen (independiente del tamaño mostrado). */
  percentCrop?: PercentCrop;
};

function centeredAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): PercentCrop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

/** Recorte en % → rectángulo en px de la imagen original, para mandar al backend. */
function percentToPixelRect(pct: PercentCrop, naturalWidth: number, naturalHeight: number) {
  return {
    left: Math.round((pct.x / 100) * naturalWidth),
    top: Math.round((pct.y / 100) * naturalHeight),
    width: Math.round((pct.width / 100) * naturalWidth),
    height: Math.round((pct.height / 100) * naturalHeight),
  };
}

export function PhotoUploadWithCrop({
  modelId: _modelId,
  type = "photo",
  onUploaded,
}: {
  /** Sólo informativo: el backend usa el modelId de la sesión, nunca este. */
  modelId?: string;
  type?: PhotoType;
  onUploaded?: () => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftCrop, setDraftCrop] = useState<Crop>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const maxItems = type === "banner" ? 1 : MAX_PHOTOS;
  const aspect = TARGET_ASPECT[type];
  const label = type === "banner" ? "banner (16:9)" : "foto de perfil (3:4)";

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError("");
    setDone("");
    if (!chosen.length) return;

    const room = maxItems - items.length;
    if (chosen.length > room) {
      setError(`Máximo ${maxItems} ${type === "banner" ? "banner" : "fotos"}.`);
      return;
    }

    for (const file of chosen) {
      if (!ACCEPT.split(",").includes(file.type)) {
        setError("Formato no permitido (usa JPG, PNG o WebP).");
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setError(`"${file.name}" supera los 5MB.`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      const probe = new Image();
      probe.onload = () => {
        setItems((prev) => [
          ...prev,
          {
            id: `${file.name}-${file.lastModified}-${prev.length}`,
            file,
            preview,
            naturalWidth: probe.naturalWidth,
            naturalHeight: probe.naturalHeight,
            needsCrop: needsManualCrop(probe.naturalWidth, probe.naturalHeight, type),
          },
        ]);
      };
      probe.onerror = () => {
        URL.revokeObjectURL(preview);
        setError(`No se pudo leer "${file.name}".`);
      };
      probe.src = preview;
    }
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const gone = prev.find((it) => it.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return prev.filter((it) => it.id !== id);
    });
    if (editing === id) setEditing(null);
  }

  function openEditor(id: string) {
    const item = items.find((it) => it.id === id);
    setDraftCrop(item?.percentCrop);
    setEditing(id);
  }

  function confirmCrop() {
    if (editing && draftCrop && draftCrop.width > 0) {
      const pct = draftCrop as PercentCrop;
      setItems((prev) =>
        prev.map((it) => (it.id === editing ? { ...it, percentCrop: pct } : it)),
      );
    }
    setEditing(null);
    setDraftCrop(undefined);
  }

  async function handleUpload() {
    setUploading(true);
    setError("");
    setDone("");
    try {
      const body = new FormData();
      body.append("type", type);
      items.forEach((it, index) => {
        body.append("photos", it.file);
        if (it.percentCrop) {
          body.append(
            `crop_${index}`,
            JSON.stringify(
              percentToPixelRect(it.percentCrop, it.naturalWidth, it.naturalHeight),
            ),
          );
        }
      });

      const res = await fetch("/api/modelos/fotos/upload", { method: "POST", body });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "No se pudo subir.");
      }

      const results: Array<{ success: boolean; error?: string }> = data?.results ?? [];
      const okCount = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success);

      items.forEach((it) => URL.revokeObjectURL(it.preview));
      setItems([]);
      setEditing(null);
      setDone(`Subida completada: ${okCount} de ${results.length}.`);
      if (failed.length) {
        setError(failed.map((f) => f.error).filter(Boolean).join(" · "));
      }
      onUploaded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir.");
    } finally {
      setUploading(false);
    }
  }

  const editingItem = editing ? items.find((it) => it.id === editing) : null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
          {error}
        </div>
      )}
      {done && (
        <div className="rounded-md bg-secondary/40 px-4 py-3 text-sm text-accent">{done}</div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={type === "photo"}
        className="hidden"
        onChange={handleSelect}
        disabled={uploading}
      />

      {items.length < maxItems && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-white p-10 text-center text-dark/50">
          <UploadCloud className="h-8 w-8" />
          <p className="text-xs">
            {type === "banner"
              ? "1 banner · se recorta a 16:9 y se optimiza a ≤400KB"
              : `Hasta ${MAX_PHOTOS} fotos · se recortan a 3:4 y se optimizan a ≤400KB`}
          </p>
          <Button type="button" onClick={() => inputRef.current?.click()} loading={uploading}>
            Elegir {label}
          </Button>
        </div>
      )}

      {editingItem && (
        <div className="space-y-2 rounded-md border border-border bg-white p-4">
          <p className="text-sm font-semibold text-dark">
            Ajusta el encuadre ({type === "banner" ? "16:9" : "3:4"})
          </p>
          <ReactCrop
            crop={draftCrop}
            aspect={aspect}
            keepSelection
            onChange={(_px, percent) => setDraftCrop(percent)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={editingItem.preview}
              alt={`Recorte de ${editingItem.file.name}`}
              className="max-h-[60vh] w-auto"
              onLoad={(e) => {
                if (draftCrop) return;
                const { naturalWidth, naturalHeight } = e.currentTarget;
                setDraftCrop(centeredAspectCrop(naturalWidth, naturalHeight, aspect));
              }}
            />
          </ReactCrop>
          <div className="flex gap-2">
            <Button type="button" onClick={confirmCrop}>
              Listo
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-md border border-border bg-white p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt={item.file.name}
                className={`w-16 rounded object-cover ${
                  type === "banner" ? "aspect-video" : "aspect-[3/4]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-dark">{item.file.name}</p>
                <p className="text-xs text-dark/50">
                  {(item.file.size / 1024).toFixed(0)} KB · {item.naturalWidth}×
                  {item.naturalHeight}
                </p>
                {item.needsCrop && !item.percentCrop && (
                  <p className="text-xs text-danger-dark">
                    Proporción distinta a {type === "banner" ? "16:9" : "3:4"} — se recortará
                    al centro.
                  </p>
                )}
                {item.percentCrop && (
                  <p className="text-xs text-accent">Encuadre ajustado ✓</p>
                )}
                <button
                  type="button"
                  onClick={() => openEditor(item.id)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {item.percentCrop ? "Reajustar encuadre" : "Ajustar encuadre"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                aria-label={`Quitar ${item.file.name}`}
                className="rounded p-1 text-dark/40 hover:bg-light_bg hover:text-dark"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <Button type="button" fullWidth onClick={handleUpload} loading={uploading}>
          {uploading ? "Subiendo…" : `Subir ${items.length} ${items.length === 1 ? "archivo" : "archivos"}`}
        </Button>
      )}
    </div>
  );
}
