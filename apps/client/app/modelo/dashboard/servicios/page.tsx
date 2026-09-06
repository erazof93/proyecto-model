import { notFound } from "next/navigation";
import { ServicesManager } from "@/components/dashboard/ServicesManager";
import { getSession } from "@/lib/auth/session";
import { getServicesAndChecklists } from "@/lib/db/queries";

export default async function ServiciosPage() {
  const session = await getSession();
  const data = session?.modelId ? await getServicesAndChecklists(session.modelId) : null;
  if (!data) notFound();

  return (
    <div>
      <h1 className="mb-2 text-xl font-bold text-dark">Mis servicios</h1>
      <p className="mb-6 text-sm text-dark/50">
        Indica qué servicios ofreces. Los clientes verán esto en tu perfil.
      </p>
      <ServicesManager checklists={data.checklists} initialAssignedIds={data.assignedIds} />
    </div>
  );
}
