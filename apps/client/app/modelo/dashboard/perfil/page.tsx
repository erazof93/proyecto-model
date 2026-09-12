import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { getSession } from "@/lib/auth/session";
import { getModeloById, getModelPhotos, getServicesAndChecklists } from "@/lib/db/queries";

export default async function PerfilPage() {
  const session = await getSession();
  const model = session?.modelId ? await getModeloById(session.modelId) : null;
  if (!model) notFound();

  const [photos, services] = await Promise.all([
    getModelPhotos(session!.modelId!),
    getServicesAndChecklists(session!.modelId!),
  ]);
  const primaryPhoto = photos.find((p) => p.is_primary) ?? photos[0] ?? null;

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-dark">Mi perfil</h1>
      <ProfileForm
        model={model}
        primaryPhotoUrl={primaryPhoto?.cloudinary_url ?? null}
        servicesCount={services?.assignedIds.length ?? 0}
      />
    </div>
  );
}
