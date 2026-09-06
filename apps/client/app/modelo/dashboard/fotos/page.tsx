import { PhotosManager } from "@/components/dashboard/PhotosManager";
import { getSession } from "@/lib/auth/session";
import { getModelPhotos } from "@/lib/db/queries";

export default async function FotosPage() {
  const session = await getSession();
  const photos = session?.modelId ? await getModelPhotos(session.modelId) : [];

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-dark">Mis fotos</h1>
      <p className="mb-6 text-sm text-dark/50">
        Sube fotos profesionales. Las fotos deben ser aprobadas por un admin antes de aparecer en
        tu perfil público.
      </p>
      <PhotosManager initialPhotos={photos} />
    </div>
  );
}
