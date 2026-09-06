import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ModeloDetailManager } from "@/components/admin/ModeloDetailManager";
import { getModeloDetail, getModelPhotosAdmin, getModelChecklists } from "@/lib/db/admin-queries";

export const dynamic = "force-dynamic";

const genderLabel: Record<string, string> = { WOMAN: "Mujer", MAN: "Hombre", TRANSGENDER: "Trans" };

export default async function ModeloDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const modelo = await getModeloDetail(id);
  if (!modelo) notFound();

  const [photos, checklists] = await Promise.all([
    getModelPhotosAdmin(id),
    getModelChecklists(id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-dark">{modelo.name}</h1>
            {modelo.is_verified && <Badge variant="success">Verificada</Badge>}
            {modelo.status === "SUSPENDED" && <Badge variant="danger">Suspendida</Badge>}
          </div>
          <p className="text-dark/50">@{modelo.username}</p>
        </div>
        <Link href="/dashboard/modelos" className="text-sm font-medium text-primary hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-light_bg p-4">
          <p className="text-xs text-dark/40">Género</p>
          <p className="font-semibold text-dark">{genderLabel[modelo.gender] ?? modelo.gender}</p>
        </div>
        <div className="rounded-md bg-light_bg p-4">
          <p className="text-xs text-dark/40">Edad</p>
          <p className="font-semibold text-dark">{modelo.age} años</p>
        </div>
        <div className="rounded-md bg-light_bg p-4">
          <p className="text-xs text-dark/40">Ciudad</p>
          <p className="font-semibold text-dark">{modelo.city ?? "No especificado"}</p>
        </div>
        <div className="rounded-md bg-light_bg p-4">
          <p className="text-xs text-dark/40">Onboarding</p>
          <p className="font-semibold text-dark">{modelo.onboardingPercentage}%</p>
        </div>
      </div>

      {checklists.length > 0 && (
        <div className="rounded-md bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 text-lg font-bold text-dark">Servicios que ofrece</h2>
          <div className="flex flex-wrap gap-2">
            {checklists.map((c) => (
              <Badge key={c.id} variant="neutral">
                {c.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <ModeloDetailManager modelo={modelo} initialPhotos={photos} />
    </div>
  );
}
