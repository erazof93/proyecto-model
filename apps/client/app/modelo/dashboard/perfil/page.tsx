import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { getSession } from "@/lib/auth/session";
import { getModeloById } from "@/lib/db/queries";

export default async function PerfilPage() {
  const session = await getSession();
  const model = session?.modelId ? await getModeloById(session.modelId) : null;
  if (!model) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-dark">Mi perfil</h1>
      <ProfileForm model={model} />
    </div>
  );
}
