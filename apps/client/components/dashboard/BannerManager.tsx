"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BannerRequest, ModelPhoto } from "@proyecto-model/types";
import { PhotoUploadWithCrop } from "@/components/dashboard/PhotoUploadWithCrop";
import { BannerRequestForm } from "@/components/dashboard/BannerRequestForm";

const STATUS_LABEL: Record<BannerRequest["status"], string> = {
  PENDING: "⏳ En revisión por el admin",
  APPROVED: "✅ Aprobada — sube tu foto abajo",
  REJECTED: "❌ Rechazada",
};

export function BannerManager({
  initialBanner,
  initialRequests,
}: {
  initialBanner: ModelPhoto | null;
  initialRequests: BannerRequest[];
}) {
  const router = useRouter();
  const [banner, setBanner] = useState(initialBanner);
  const [requests, setRequests] = useState(initialRequests);
  const latest = requests[0] ?? null;

  // El padre (Server Component) re-fetch tras router.refresh(); useState solo
  // toma los valores iniciales en el primer mount, hay que re-sincronizar.
  useEffect(() => setBanner(initialBanner), [initialBanner]);
  useEffect(() => setRequests(initialRequests), [initialRequests]);

  if (banner) {
    return (
      <div className="space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.cloudinary_url}
          alt="Banner actual"
          className="aspect-video w-full max-w-2xl rounded-md object-cover"
        />
        <p className="text-sm text-dark/50">
          Este es tu banner activo. Si quieres cambiarlo, solicita uno nuevo — se reemplazará al
          subir la foto aprobada.
        </p>
      </div>
    );
  }

  if (latest?.status === "APPROVED") {
    return (
      <div className="space-y-4">
        <p className="rounded-md bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
          {STATUS_LABEL.APPROVED}
        </p>
        <PhotoUploadWithCrop
          type="banner"
          onUploaded={() => {
            router.refresh();
          }}
        />
      </div>
    );
  }

  if (latest?.status === "PENDING") {
    return (
      <p className="rounded-md bg-light_bg px-4 py-3 text-sm text-dark">
        {STATUS_LABEL.PENDING}: “{latest.title}”
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {latest?.status === "REJECTED" && (
        <p className="rounded-md bg-danger-light px-4 py-3 text-sm text-danger-dark">
          Tu última solicitud fue rechazada
          {latest.admin_notes ? `: ${latest.admin_notes}` : "."} Puedes enviar una nueva.
        </p>
      )}
      <BannerRequestForm onRequested={() => router.refresh()} />
    </div>
  );
}
