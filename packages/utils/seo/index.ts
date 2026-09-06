// ============================================================================
// SEO helpers - generación de metadata para Next.js (App Router)
// ============================================================================
import type { Model } from "@proyecto-model/types";

type OgImage = { url: string };

export type PageMetadata = {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    type: "website" | "profile";
    images?: OgImage[];
  };
  twitter: {
    card: "summary" | "summary_large_image";
    title: string;
    description: string;
    images?: string[];
  };
};

/** Metadata para la página de perfil de una modelo. */
export function generateModelMetadata(model: Model): PageMetadata {
  const title = `${model.name} - Perfil verificado`;
  const description = `Conoce a ${model.name}. ${model.bio?.substring(0, 120) ?? ""}`.trim();
  const imageUrl = model.avatar_url ?? "/placeholder-model.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/** Metadata para la home del sitio. */
export function generateHomeMetadata(): PageMetadata {
  const title = "Marketplace de modelos - Perfiles verificados";
  const description =
    "Explora perfiles verificados y contacta directamente. Marketplace de modelos.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
