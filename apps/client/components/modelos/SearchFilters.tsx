import { Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cities, serviceOptions } from "@/lib/mock-data";

export function SearchFilters() {
  return (
    <form action="/modelos" method="GET" className="border-b border-border bg-white px-6 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark/30" />
          <Input name="q" placeholder="Buscar..." className="pl-9" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Select name="gender" label="Género" defaultValue="WOMAN" className="sm:w-48">
            <option value="WOMAN">Mujer</option>
            <option value="MAN">Hombre</option>
            <option value="TRANSGENDER">Transexual</option>
          </Select>
          <Select name="service" label="Servicio" defaultValue={serviceOptions[0]} className="sm:w-56">
            {serviceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select name="city" label="Ciudad" defaultValue={cities[0]} className="sm:w-40">
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Button type="submit" className="sm:w-auto">
            Buscar
          </Button>
        </div>
      </div>
    </form>
  );
}
