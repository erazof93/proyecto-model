import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ModelosTable } from "@/components/dashboard/ModelosTable";
import { getAllModelos } from "@/lib/db/admin-queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ search?: string; verified?: string }>;

export default async function AdminModelosPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const modelos = await getAllModelos({
    search: params.search,
    isVerified: params.verified ? params.verified === "true" : undefined,
  });

  return (
    <div>
      <form
        action="/dashboard/modelos"
        method="GET"
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/30" />
          <Input
            name="search"
            placeholder="Buscar por nombre..."
            defaultValue={params.search}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select name="verified" defaultValue={params.verified ?? ""} aria-label="Estado">
            <option value="">Todos</option>
            <option value="true">Verificadas</option>
            <option value="false">Pendientes</option>
          </Select>
          <Button type="submit">Filtrar</Button>
        </div>
      </form>

      <ModelosTable initialModelos={modelos} />
    </div>
  );
}
